/**
 * Motor de recomendações prescritivas (Pilar A: de descritivo para prescritivo).
 *
 * Não basta mostrar o dado — a PulsoViva diz O QUE FAZER e estima o impacto.
 * Converte os sinais das análises (vagas ociosas, risco de falta, gargalo,
 * abandono, equidade) em um plano de ação priorizado e acionável.
 */

import {
  segmentLabels,
  type Segment,
} from "@/lib/segment";

export type RecommendationInput = {
  openSlots: number;
  highRiskAppointments: number;
  criticalBottleneck: {
    specialty: string;
    projection90: number;
    queueTotal: number;
  } | null;
  abandonmentHigh: number;
  equityWorst: { dimension: string; group: string; ratio: number } | null;
  slotValueCents: number;
  segment: Segment;
};

export type Recommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  detail: string;
  impact: string;
  href: string;
};

const NO_SHOW_REDUCTION = 0.22; // redução típica de no-show com confirmação ativa

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function buildRecommendations(
  input: RecommendationInput,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const isPrivate = input.segment === "privado";
  const L = segmentLabels(input.segment);

  // 1. Vagas ociosas → encaixe.
  if (input.openSlots > 0) {
    const value = input.openSlots * input.slotValueCents;
    recs.push({
      id: "encaixe",
      priority: input.openSlots >= 5 ? "high" : "medium",
      category: "Encaixe",
      title: `Preencher ${input.openSlots} vaga(s) ociosa(s)`,
      detail:
        "Há vagas abertas por cancelamento ou falta. Use o ranking de encaixe para chamar os melhores candidatos da fila.",
      impact: isPrivate
        ? `Recupera até ${brl(value)} em receita.`
        : `Recupera até ${input.openSlots} atendimento(s).`,
      href: "/dashboard/encaixe",
    });
  }

  // 2. Agendamentos de alto risco → confirmação ativa.
  if (input.highRiskAppointments > 0) {
    const avoided = Math.round(input.highRiskAppointments * NO_SHOW_REDUCTION);
    const value = avoided * input.slotValueCents;
    recs.push({
      id: "antifalta",
      priority: input.highRiskAppointments >= 10 ? "high" : "medium",
      category: "Antifalta",
      title: `Confirmar ${input.highRiskAppointments} agendamento(s) de alto risco`,
      detail:
        "Dispare confirmação para os pacientes com maior risco de falta antes da data.",
      impact: isPrivate
        ? `Evita ~${avoided} falta(s) (${brl(value)} preservados).`
        : `Evita ~${avoided} falta(s) e libera vagas com antecedência.`,
      href: "/dashboard/risco",
    });
  }

  // 3. Gargalo crítico → reforço de capacidade.
  if (input.criticalBottleneck) {
    const b = input.criticalBottleneck;
    const growth = b.projection90 - b.queueTotal;
    recs.push({
      id: "gargalo",
      priority: "high",
      category: "Capacidade",
      title: `Reforçar capacidade em ${b.specialty}`,
      detail:
        "A fila desta especialidade cresce acima da capacidade. Antecipe mutirão ou realocação antes de virar crise.",
      impact: `Projeção de +${growth > 0 ? growth : 0} na fila em 90 dias (de ${b.queueTotal} para ${b.projection90}).`,
      href: "/dashboard/gargalos",
    });
  }

  // 4. Abandono → busca ativa / recall.
  if (input.abandonmentHigh > 0) {
    recs.push({
      id: "abandono",
      priority: input.abandonmentHigh >= 10 ? "high" : "medium",
      category: "Continuidade",
      title: `${L.reactivationTitle}: ${input.abandonmentHigh} paciente(s) em risco`,
      detail:
        "Pacientes prestes a abandonar o cuidado. Acione contato para retomar o acompanhamento.",
      impact: isPrivate
        ? "Recupera receita recorrente (LTV) de pacientes inativos."
        : "Previne agravamento e abandono de tratamento contínuo.",
      href: "/dashboard/reativacao",
    });
  }

  // 5. Equidade → priorizar grupo penalizado.
  if (input.equityWorst && input.equityWorst.ratio >= 1.5) {
    const e = input.equityWorst;
    recs.push({
      id: "equidade",
      priority: "medium",
      category: "Equidade",
      title: `Priorizar grupo mais penalizado: ${e.group}`,
      detail: `Em ${e.dimension.toLowerCase()}, este grupo espera muito mais que os demais. Ajustar a priorização aproxima a fila da equidade.`,
      impact: `Disparidade de ${e.ratio.toFixed(1)}× no tempo de espera.`,
      href: "/dashboard/equidade",
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
}
