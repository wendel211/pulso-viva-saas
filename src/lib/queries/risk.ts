import "server-only";
import { and, eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { riskScores, appointments, accessRequests, patients } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import type { RiskFactor } from "@/lib/risk/baseline";

export type RiskRow = {
  appointmentId: string;
  score: number;
  band: "low" | "medium" | "high";
  factors: RiskFactor[];
  patientName: string | null;
  specialty: string | null;
  scheduledAt: Date | null;
  status: string;
};

/** Lista todos os scores calculados da organização, do mais alto ao mais baixo. */
export async function getRiskList(): Promise<RiskRow[]> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({
      appointmentId: riskScores.targetId,
      score: riskScores.score,
      band: riskScores.band,
      factors: riskScores.factors,
      patientName: patients.name,
      specialty: accessRequests.specialty,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
    })
    .from(riskScores)
    .innerJoin(
      appointments,
      and(
        eq(riskScores.targetId, appointments.id),
        eq(riskScores.targetType, "appointment"),
      ),
    )
    .leftJoin(accessRequests, eq(appointments.requestId, accessRequests.id))
    .leftJoin(patients, eq(accessRequests.patientId, patients.id))
    .where(eq(riskScores.organizationId, organizationId))
    .orderBy(desc(riskScores.score));

  return rows.map((r) => ({
    ...r,
    band: r.band as RiskRow["band"],
    factors: (r.factors ?? []) as RiskFactor[],
  }));
}
