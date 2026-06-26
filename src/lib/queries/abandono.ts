import "server-only";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointments, accessRequests, patients } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import {
  calculateAbandonmentRisk,
  isContinuityCare,
  type AbandonmentFactor,
} from "@/lib/abandono/engine";

export type AbandonmentRow = {
  patientId: string;
  patientName: string | null;
  contact: string | null;
  specialty: string | null;
  score: number;
  band: "low" | "medium" | "high";
  reachable: boolean;
  daysSinceLastActivity: number | null;
  factors: AbandonmentFactor[];
};

const DAY = 1000 * 60 * 60 * 24;
const FUTURE_STATUSES = new Set(["scheduled", "confirmed", "rescheduled"]);

/**
 * Lista pacientes em risco de abandono do cuidado (continuidade), ordenada
 * do maior risco ao menor. Considera apenas quem já entrou na agenda.
 */
export async function getAbandonmentList(): Promise<AbandonmentRow[]> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({
      patientId: patients.id,
      patientName: patients.name,
      contact: patients.contact,
      specialty: accessRequests.specialty,
      status: appointments.status,
      scheduledAt: appointments.scheduledAt,
    })
    .from(appointments)
    .innerJoin(accessRequests, eq(appointments.requestId, accessRequests.id))
    .innerJoin(patients, eq(accessRequests.patientId, patients.id))
    .where(eq(appointments.organizationId, organizationId))
    .limit(2000);

  type Agg = {
    patientName: string | null;
    contact: string | null;
    specialties: Set<string>;
    noShowCount: number;
    cancellationCount: number;
    attendedCount: number;
    lastPast: number | null;
    hasFuture: boolean;
  };

  const now = Date.now();
  const byPatient = new Map<string, Agg>();

  for (const r of rows) {
    let agg = byPatient.get(r.patientId);
    if (!agg) {
      agg = {
        patientName: r.patientName,
        contact: r.contact,
        specialties: new Set(),
        noShowCount: 0,
        cancellationCount: 0,
        attendedCount: 0,
        lastPast: null,
        hasFuture: false,
      };
      byPatient.set(r.patientId, agg);
    }

    if (r.specialty) agg.specialties.add(r.specialty);
    if (r.status === "no_show") agg.noShowCount++;
    if (r.status === "cancelled") agg.cancellationCount++;
    if (r.status === "attended") agg.attendedCount++;

    const t = r.scheduledAt ? r.scheduledAt.getTime() : null;
    if (t != null) {
      if (t <= now) agg.lastPast = Math.max(agg.lastPast ?? 0, t);
      if (t > now && FUTURE_STATUSES.has(r.status)) agg.hasFuture = true;
    }
  }

  const result: AbandonmentRow[] = [];
  for (const [patientId, agg] of byPatient) {
    // Prioriza uma especialidade de cuidado contínuo, se houver.
    const specs = [...agg.specialties];
    const specialty =
      specs.find((s) => isContinuityCare(s)) ?? specs[0] ?? null;

    const daysSinceLastActivity =
      agg.lastPast != null
        ? Math.floor((now - agg.lastPast) / DAY)
        : null;

    const risk = calculateAbandonmentRisk({
      noShowCount: agg.noShowCount,
      cancellationCount: agg.cancellationCount,
      attendedCount: agg.attendedCount,
      daysSinceLastActivity,
      hasFutureAppointment: agg.hasFuture,
      specialty,
      hasContact: Boolean(agg.contact && agg.contact.trim() !== ""),
    });

    if (risk.band === "low") continue; // foca em quem precisa de ação

    result.push({
      patientId,
      patientName: agg.patientName,
      contact: agg.contact,
      specialty,
      score: risk.score,
      band: risk.band,
      reachable: risk.reachable,
      daysSinceLastActivity,
      factors: risk.factors,
    });
  }

  return result.sort((a, b) => b.score - a.score);
}
