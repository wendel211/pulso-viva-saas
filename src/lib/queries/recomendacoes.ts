import "server-only";

import { getOpenSlots } from "@/lib/queries/ranking";
import { getRiskList } from "@/lib/queries/risk";
import { getBottleneckForecast } from "@/lib/queries/bottleneck";
import { getAbandonmentList } from "@/lib/queries/abandono";
import { getEquityReport } from "@/lib/queries/equidade";
import { getOrgProfile } from "@/lib/queries/settings";
import {
  buildRecommendations,
  type Recommendation,
} from "@/lib/recomendacoes/engine";

/**
 * Plano de ação prescritivo: reúne os sinais das análises e devolve as ações
 * recomendadas, priorizadas e com impacto estimado.
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  const [openSlots, riskList, bottlenecks, abandono, equity, profile] =
    await Promise.all([
      getOpenSlots(),
      getRiskList(),
      getBottleneckForecast(),
      getAbandonmentList(),
      getEquityReport(),
      getOrgProfile(),
    ]);

  const highRiskAppointments = riskList.filter((r) => r.band === "high").length;
  const critical = bottlenecks.find((b) => b.criticality === "high") ?? null;
  const abandonmentHigh = abandono.filter((a) => a.band === "high").length;

  // Dimensão de maior disparidade de equidade.
  const worstDim = equity.dimensions
    .filter((d) => d.mostPenalized)
    .sort((a, b) => b.disparityRatio - a.disparityRatio)[0];

  return buildRecommendations({
    openSlots: openSlots.length,
    highRiskAppointments,
    criticalBottleneck: critical
      ? {
          specialty: critical.specialty,
          projection90: critical.projection90,
          queueTotal: critical.queueTotal,
        }
      : null,
    abandonmentHigh,
    equityWorst: worstDim
      ? {
          dimension: worstDim.label,
          group: worstDim.mostPenalized as string,
          ratio: worstDim.disparityRatio,
        }
      : null,
    slotValueCents: profile.slotValueCents,
    segment: profile.segment,
  });
}
