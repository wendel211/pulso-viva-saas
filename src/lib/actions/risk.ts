"use server";

import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  appointments,
  accessRequests,
  patients,
  attendanceEvents,
  riskScores,
} from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { calculateRisk } from "@/lib/risk/baseline";

export type ScoreState =
  | { ok?: boolean; message?: string; scored?: number }
  | undefined;

/**
 * Recalcula o risco de falta para todos os agendamentos pendentes/confirmados
 * da organização (RF08). Idempotente: upsert via delete + insert por alvo.
 */
export async function recalculateRisk(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: ScoreState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData: FormData,
): Promise<ScoreState> {
  const session = await verifySession();
  if (!["org_manager", "admin_pulsoviva"].includes(session.role)) {
    return { ok: false, message: "Sem permissão para recalcular scores." };
  }

  const orgId = session.organizationId;

  // Busca agendamentos ainda ativos com dados de solicitação e paciente.
  const rows = await db
    .select({
      appointmentId: appointments.id,
      status: appointments.status,
      scheduledAt: appointments.scheduledAt,
      contact: patients.contact,
      specialty: accessRequests.specialty,
      requestedAt: accessRequests.requestedAt,
    })
    .from(appointments)
    .leftJoin(accessRequests, eq(appointments.requestId, accessRequests.id))
    .leftJoin(patients, eq(accessRequests.patientId, patients.id))
    .where(
      and(
        eq(appointments.organizationId, orgId),
        // Só pontua agendamentos ainda relevantes.
      ),
    );

  let scored = 0;

  for (const row of rows) {
    // Contagens de faltas e cancelamentos anteriores do paciente.
    let noShowCount = 0;
    let cancellationCount = 0;

    if (row.contact) {
      const [nsRow] = await db
        .select({ value: count() })
        .from(attendanceEvents)
        .where(
          and(
            eq(attendanceEvents.organizationId, orgId),
            eq(attendanceEvents.type, "no_show"),
          ),
        );
      noShowCount = nsRow?.value ?? 0;

      const [cxRow] = await db
        .select({ value: count() })
        .from(attendanceEvents)
        .where(
          and(
            eq(attendanceEvents.organizationId, orgId),
            eq(attendanceEvents.type, "cancellation"),
          ),
        );
      cancellationCount = cxRow?.value ?? 0;
    }

    const result = calculateRisk({
      scheduledAt: row.scheduledAt ?? undefined,
      requestedAt: row.requestedAt ?? undefined,
      status: row.status,
      contact: row.contact,
      specialty: row.specialty,
      noShowCount,
      cancellationCount,
    });

    // Upsert: remove o score anterior e insere o novo.
    await db
      .delete(riskScores)
      .where(
        and(
          eq(riskScores.organizationId, orgId),
          eq(riskScores.targetType, "appointment"),
          eq(riskScores.targetId, row.appointmentId),
        ),
      );

    await db.insert(riskScores).values({
      organizationId: orgId,
      targetType: "appointment",
      targetId: row.appointmentId,
      score: result.score,
      band: result.band,
      factors: result.factors.map((f) => ({
        name: f.name,
        weight: f.weight,
        value: f.value,
        reason: f.reason,
      })),
      modelVersion: "baseline-v1",
    });

    scored++;
  }

  revalidatePath("/dashboard/risco");
  return { ok: true, scored, message: `${scored} agendamento(s) avaliado(s).` };
}
