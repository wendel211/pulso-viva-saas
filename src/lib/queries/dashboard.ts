import "server-only";
import { and, eq, count, sql } from "drizzle-orm";

import { db } from "@/db";
import { accessRequests, appointments, patients } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type DashboardKpis = {
  queueTotal: number;
  patients: number;
  noShows: number;
  cancellations: number;
  confirmed: number;
  scheduled: number;
};

/** KPIs gerais da organização do usuário (RF06), sempre filtrados por tenant. */
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const { organizationId } = await verifySession();
  const orgFilter = eq(appointments.organizationId, organizationId);

  const statusCount = async (status: typeof appointments.status.enumValues[number]) => {
    const [row] = await db
      .select({ value: count() })
      .from(appointments)
      .where(and(orgFilter, eq(appointments.status, status)));
    return row?.value ?? 0;
  };

  const [queueRow] = await db
    .select({ value: count() })
    .from(accessRequests)
    .where(eq(accessRequests.organizationId, organizationId));

  const [patientRow] = await db
    .select({ value: count() })
    .from(patients)
    .where(eq(patients.organizationId, organizationId));

  const [noShows, cancellations, confirmed, scheduled] = await Promise.all([
    statusCount("no_show"),
    statusCount("cancelled"),
    statusCount("confirmed"),
    statusCount("scheduled"),
  ]);

  return {
    queueTotal: queueRow?.value ?? 0,
    patients: patientRow?.value ?? 0,
    noShows,
    cancellations,
    confirmed,
    scheduled,
  };
}

/** Filas por especialidade (RF07) — base para a tabela operacional. */
export async function getQueueBySpecialty() {
  const { organizationId } = await verifySession();
  return db
    .select({
      specialty: accessRequests.specialty,
      total: count(),
    })
    .from(accessRequests)
    .where(eq(accessRequests.organizationId, organizationId))
    .groupBy(accessRequests.specialty)
    .orderBy(sql`count(*) desc`);
}
