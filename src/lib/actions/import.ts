"use server";

import { revalidatePath } from "next/cache";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  importBatches,
  patients,
  accessRequests,
  appointments,
  units,
  auditLogs,
} from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { parseSpreadsheet } from "@/lib/import/parse";
import type { RowError } from "@/lib/import/schema";

export type ImportState =
  | {
      ok?: boolean;
      message?: string;
      batchId?: string;
      imported?: number;
      totalRows?: number;
      errors?: RowError[];
    }
  | undefined;

const APPOINTMENT_STATUSES = new Set([
  "scheduled",
  "confirmed",
  "rescheduled",
  "attended",
  "no_show",
  "cancelled",
]);

export async function importSpreadsheet(
  _state: ImportState,
  formData: FormData,
): Promise<ImportState> {
  // Autorização: gestor ou operador da organização (RF03).
  const session = await verifySession();
  if (!["org_manager", "operator", "admin_pulsoviva"].includes(session.role)) {
    return { ok: false, message: "Sem permissão para importar dados." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecione um arquivo CSV ou XLSX." };
  }

  let parsed;
  try {
    parsed = await parseSpreadsheet(file);
  } catch {
    return { ok: false, message: "Não foi possível ler o arquivo. Verifique o formato." };
  }

  const orgId = session.organizationId;

  // Cria o batch (histórico de importações — RF05).
  const [batch] = await db
    .insert(importBatches)
    .values({
      organizationId: orgId,
      fileName: file.name,
      status: parsed.errors.length > 0 ? "validated" : "completed",
      rowCount: parsed.totalRows,
      errors: parsed.errors.length > 0 ? parsed.errors : null,
    })
    .returning();

  // Cache de unidades por nome para evitar duplicar e reduzir queries.
  const unitCache = new Map<string, string>();
  async function resolveUnitId(name: string | undefined): Promise<string | undefined> {
    const key = name?.trim();
    if (!key) return undefined;
    const cached = unitCache.get(key.toLowerCase());
    if (cached) return cached;

    const existing = await db
      .select({ id: units.id })
      .from(units)
      .where(and(eq(units.organizationId, orgId), eq(units.name, key)))
      .limit(1);

    let unitId = existing[0]?.id;
    if (!unitId) {
      const [created] = await db
        .insert(units)
        .values({ organizationId: orgId, name: key })
        .returning({ id: units.id });
      unitId = created.id;
    }
    unitCache.set(key.toLowerCase(), unitId);
    return unitId;
  }

  // Normaliza e grava cada linha válida no Hub.
  let imported = 0;
  for (const row of parsed.rows) {
    const [patient] = await db
      .insert(patients)
      .values({
        organizationId: orgId,
        externalId: row.externalId,
        name: row.patientName,
        contact: row.contact,
        age: row.age,
      })
      .returning();

    let requestId: string | undefined;
    if (row.specialty || row.procedure || row.requestedAt) {
      const [req] = await db
        .insert(accessRequests)
        .values({
          organizationId: orgId,
          patientId: patient.id,
          specialty: row.specialty,
          procedure: row.procedure,
          requestedAt: row.requestedAt,
          priority: row.priority,
          origin: "import",
        })
        .returning();
      requestId = req.id;
    }

    if (row.scheduledAt || row.professional || row.status || row.unit) {
      const unitId = await resolveUnitId(row.unit);
      await db.insert(appointments).values({
        organizationId: orgId,
        requestId,
        unitId,
        scheduledAt: row.scheduledAt,
        professional: row.professional,
        status:
          row.status && APPOINTMENT_STATUSES.has(row.status)
            ? (row.status as (typeof appointments.status.enumValues)[number])
            : "scheduled",
      });
    }

    imported++;
  }

  // Audit log da importação (LGPD — RF16).
  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.userId,
    action: "import",
    resource: `import_batch:${batch.id}`,
    metadata: { fileName: file.name, imported, errors: parsed.errors.length },
  });

  revalidatePath("/dashboard");

  return {
    ok: true,
    batchId: batch.id,
    imported,
    totalRows: parsed.totalRows,
    errors: parsed.errors,
    message:
      parsed.errors.length > 0
        ? `${imported} registro(s) importado(s). ${parsed.errors.length} erro(s) encontrados.`
        : `${imported} registro(s) importado(s) com sucesso.`,
  };
}
