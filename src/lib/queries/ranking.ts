import "server-only";
import { and, eq, inArray, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import {
  appointments,
  accessRequests,
  patients,
  riskScores,
} from "@/db/schema";
import { verifySession } from "@/lib/dal";
import {
  rankCandidates,
  type CandidateInput,
  type RankedCandidate,
} from "@/lib/ranking/engine";
import { getRankingWeights } from "@/lib/queries/settings";

export type OpenSlot = {
  appointmentId: string;
  scheduledAt: Date | null;
  specialty: string | null;
  professional: string | null;
};

/** Vagas abertas = agendamentos cancelados ou com status no_show sem substituto. */
export async function getOpenSlots(): Promise<OpenSlot[]> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({
      appointmentId: appointments.id,
      scheduledAt: appointments.scheduledAt,
      specialty: accessRequests.specialty,
      professional: appointments.professional,
    })
    .from(appointments)
    .leftJoin(accessRequests, eq(appointments.requestId, accessRequests.id))
    .where(
      and(
        eq(appointments.organizationId, organizationId),
        inArray(appointments.status, ["cancelled", "no_show"]),
      ),
    )
    .orderBy(appointments.scheduledAt);

  return rows.map((r) => ({ ...r, scheduledAt: r.scheduledAt ?? null }));
}

/**
 * Retorna a lista rankeada de candidatos para uma vaga específica.
 * Considera todos os pacientes em fila (status scheduled/confirmed) da mesma
 * especialidade — ou todos se a vaga não tiver especialidade definida.
 */
export async function getRankedCandidates(
  vacancySpecialty: string | null,
): Promise<RankedCandidate[]> {
  const { organizationId } = await verifySession();
  const weights = await getRankingWeights();

  // Pacientes em fila = solicitações sem agendamento confirmado/atendido.
  const rows = await db
    .select({
      requestId: accessRequests.id,
      patientId: patients.id,
      patientName: patients.name,
      contact: patients.contact,
      specialty: accessRequests.specialty,
      requestedAt: accessRequests.requestedAt,
      priority: accessRequests.priority,
      riskScore: riskScores.score,
    })
    .from(accessRequests)
    .innerJoin(patients, eq(accessRequests.patientId, patients.id))
    .leftJoin(
      riskScores,
      and(
        eq(riskScores.targetType, "appointment"),
        eq(riskScores.organizationId, organizationId),
      ),
    )
    .where(
      and(
        eq(accessRequests.organizationId, organizationId),
        // Filtra pela especialidade da vaga se disponível.
        vacancySpecialty
          ? eq(accessRequests.specialty, vacancySpecialty)
          : or(
              isNull(accessRequests.specialty),
              eq(accessRequests.specialty, ""),
            ),
      ),
    )
    .limit(200);

  const candidates: CandidateInput[] = rows.map((r) => ({
    requestId: r.requestId,
    patientId: r.patientId,
    patientName: r.patientName,
    contact: r.contact,
    specialty: r.specialty,
    requestedAt: r.requestedAt,
    priority: r.priority,
    riskScore: r.riskScore,
  }));

  // Se não há candidatos com a especialidade exata, busca todos da fila.
  if (candidates.length === 0 && vacancySpecialty) {
    const allRows = await db
      .select({
        requestId: accessRequests.id,
        patientId: patients.id,
        patientName: patients.name,
        contact: patients.contact,
        specialty: accessRequests.specialty,
        requestedAt: accessRequests.requestedAt,
        priority: accessRequests.priority,
        riskScore: riskScores.score,
      })
      .from(accessRequests)
      .innerJoin(patients, eq(accessRequests.patientId, patients.id))
      .leftJoin(
        riskScores,
        and(
          eq(riskScores.targetType, "appointment"),
          eq(riskScores.organizationId, organizationId),
        ),
      )
      .where(eq(accessRequests.organizationId, organizationId))
      .limit(200);

    return rankCandidates(
      allRows.map((r) => ({ ...r, riskScore: r.riskScore })),
      vacancySpecialty,
      weights,
    );
  }

  return rankCandidates(candidates, vacancySpecialty, weights);
}
