import "server-only";
import { and, eq, gte, count, sql } from "drizzle-orm";

import { db } from "@/db";
import { accessRequests, appointments } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type CriticalityLevel = "low" | "medium" | "high";

export type BottleneckRow = {
  specialty: string;
  queueTotal: number;
  inflow30d: number;
  outflow30d: number;
  netRatePerMonth: number;
  projection30: number;
  projection60: number;
  projection90: number;
  criticality: CriticalityLevel;
};

/**
 * Previsão simples de gargalo por especialidade (doc §12, RF14).
 *
 * Abordagem baseline (sem ML): projeta o crescimento da fila linearmente
 * a partir da taxa líquida observada nos últimos 30 dias
 * (entradas - atendimentos concluídos). Evolui para modelo estatístico
 * quando houver histórico suficiente.
 */
export async function getBottleneckForecast(): Promise<BottleneckRow[]> {
  const { organizationId } = await verifySession();
  const since = sql`now() - interval '30 days'`;

  // Fila atual: solicitações sem agendamento concluído (attended) ou cancelado.
  const queueRows = await db
    .select({
      specialty: accessRequests.specialty,
      total: count(),
    })
    .from(accessRequests)
    .leftJoin(appointments, eq(appointments.requestId, accessRequests.id))
    .where(
      and(
        eq(accessRequests.organizationId, organizationId),
        sql`(${appointments.status} is null or ${appointments.status} not in ('attended', 'cancelled'))`,
      ),
    )
    .groupBy(accessRequests.specialty);

  // Entradas recentes (novas solicitações nos últimos 30 dias).
  const inflowRows = await db
    .select({
      specialty: accessRequests.specialty,
      total: count(),
    })
    .from(accessRequests)
    .where(
      and(
        eq(accessRequests.organizationId, organizationId),
        gte(accessRequests.requestedAt, since),
      ),
    )
    .groupBy(accessRequests.specialty);

  // Saídas recentes (atendimentos concluídos nos últimos 30 dias).
  const outflowRows = await db
    .select({
      specialty: accessRequests.specialty,
      total: count(),
    })
    .from(appointments)
    .innerJoin(accessRequests, eq(appointments.requestId, accessRequests.id))
    .where(
      and(
        eq(appointments.organizationId, organizationId),
        eq(appointments.status, "attended"),
        gte(appointments.scheduledAt, since),
      ),
    )
    .groupBy(accessRequests.specialty);

  const inflowMap = new Map(
    inflowRows.map((r) => [r.specialty ?? "Sem especialidade", r.total]),
  );
  const outflowMap = new Map(
    outflowRows.map((r) => [r.specialty ?? "Sem especialidade", r.total]),
  );

  return queueRows.map((q) => {
    const specialty = q.specialty ?? "Sem especialidade";
    const inflow30d = inflowMap.get(specialty) ?? 0;
    const outflow30d = outflowMap.get(specialty) ?? 0;
    const netRatePerMonth = inflow30d - outflow30d;

    const projection30 = Math.max(0, Math.round(q.total + netRatePerMonth));
    const projection60 = Math.max(0, Math.round(q.total + netRatePerMonth * 2));
    const projection90 = Math.max(0, Math.round(q.total + netRatePerMonth * 3));

    let criticality: CriticalityLevel = "low";
    if (netRatePerMonth > 0 && projection90 >= q.total * 1.5) {
      criticality = "high";
    } else if (netRatePerMonth > 0) {
      criticality = "medium";
    }

    return {
      specialty,
      queueTotal: q.total,
      inflow30d,
      outflow30d,
      netRatePerMonth,
      projection30,
      projection60,
      projection90,
      criticality,
    };
  }).sort((a, b) => b.projection90 - a.projection90);
}
