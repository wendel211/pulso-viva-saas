import "server-only";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { accessRequests, appointments, patients, units } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import {
  ageBand,
  computeEquity,
  type EquityRecord,
  type EquityReport,
} from "@/lib/equidade/engine";

const DAY = 1000 * 60 * 60 * 24;

/** Monta os registros de espera e calcula o Índice de Equidade de Acesso. */
export async function getEquityReport(): Promise<EquityReport> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({
      age: patients.age,
      specialty: accessRequests.specialty,
      priority: accessRequests.priority,
      requestedAt: accessRequests.requestedAt,
      scheduledAt: appointments.scheduledAt,
      city: units.city,
      unitName: units.name,
    })
    .from(accessRequests)
    .innerJoin(patients, eq(accessRequests.patientId, patients.id))
    .leftJoin(appointments, eq(appointments.requestId, accessRequests.id))
    .leftJoin(units, eq(appointments.unitId, units.id))
    .where(eq(accessRequests.organizationId, organizationId))
    .limit(5000);

  const now = Date.now();
  const records: EquityRecord[] = [];

  for (const r of rows) {
    if (!r.requestedAt) continue;
    const start = r.requestedAt.getTime();
    const end = r.scheduledAt ? r.scheduledAt.getTime() : now;
    const waitDays = Math.max(0, Math.round((end - start) / DAY));

    records.push({
      ageBand: ageBand(r.age),
      specialty: r.specialty,
      territory: r.city ?? r.unitName ?? null,
      priority: r.priority,
      waitDays,
    });
  }

  return computeEquity(records);
}
