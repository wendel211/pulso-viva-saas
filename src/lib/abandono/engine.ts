/**
 * Motor de risco de abandono de tratamento (continuidade do cuidado).
 *
 * Diferente do "risco de falta" (que olha um agendamento), este olha a
 * TRAJETÓRIA do paciente: quem está saindo do cuidado contínuo. No SUS
 * isso vira busca ativa (salvar vidas em pré-natal, crônicos, saúde mental,
 * TB); na clínica privada vira recall/reativação (recuperar LTV).
 *
 * Regras transparentes e explicáveis (fase baseline), evoluindo para ML
 * com histórico real.
 */

export type AbandonmentWeights = {
  missHistory: number; // faltas/cancelamentos acumulados
  noFuturePlan: number; // sem agendamento futuro (saiu da agenda)
  inactivityGap: number; // tempo desde a última atividade
  continuityCare: number; // amplificador: cuidado que exige retorno
};

export const DEFAULT_ABANDONMENT_WEIGHTS: AbandonmentWeights = {
  missHistory: 0.35,
  noFuturePlan: 0.3,
  inactivityGap: 0.2,
  continuityCare: 0.15,
};

/** Especialidades de cuidado continuado (retorno é parte do tratamento). */
export const CONTINUITY_SPECIALTIES = new Set([
  "psicologia",
  "psiquiatria",
  "fisioterapia",
  "nutrição",
  "nutricao",
  "ginecologia", // pré-natal
  "obstetrícia",
  "obstetricia",
  "endocrinologia", // diabetes
  "cardiologia", // hipertensão
  "pneumologia", // tuberculose
]);

export type PatientCareData = {
  noShowCount: number;
  cancellationCount: number;
  attendedCount: number;
  /** Dias desde a última atividade (qualquer agendamento). null = sem registro. */
  daysSinceLastActivity: number | null;
  hasFutureAppointment: boolean;
  specialty: string | null;
  hasContact: boolean;
};

export type AbandonmentFactor = {
  name: string;
  value: number; // 0-1
  weight: number;
  reason: string;
};

export type AbandonmentResult = {
  score: number; // 0-100, maior = mais risco de abandono
  band: "low" | "medium" | "high";
  reachable: boolean; // dá para acionar (tem contato)?
  factors: AbandonmentFactor[];
};

export function isContinuityCare(specialty: string | null): boolean {
  if (!specialty) return false;
  return CONTINUITY_SPECIALTIES.has(specialty.toLowerCase().trim());
}

export function calculateAbandonmentRisk(
  data: PatientCareData,
  weights = DEFAULT_ABANDONMENT_WEIGHTS,
): AbandonmentResult {
  const continuity = isContinuityCare(data.specialty);
  const factors: AbandonmentFactor[] = [];

  // 1. Histórico de faltas/cancelamentos.
  const misses = data.noShowCount + data.cancellationCount;
  const missValue = Math.min(misses / 3, 1);
  factors.push({
    name: "Histórico de ausências",
    value: missValue,
    weight: weights.missHistory,
    reason:
      misses > 0
        ? `${data.noShowCount} falta(s) e ${data.cancellationCount} cancelamento(s).`
        : "Sem ausências registradas.",
  });

  // 2. Sem agendamento futuro = saiu da agenda.
  const noFuture = data.hasFutureAppointment ? 0 : 1;
  factors.push({
    name: "Sem retorno agendado",
    value: noFuture,
    weight: weights.noFuturePlan,
    reason: data.hasFutureAppointment
      ? "Possui agendamento futuro."
      : "Nenhum retorno agendado — fora da agenda.",
  });

  // 3. Tempo de inatividade.
  const days = data.daysSinceLastActivity;
  let gapValue = 0;
  let gapReason = "Atividade recente.";
  if (days == null) {
    gapValue = 0.3;
    gapReason = "Sem histórico de atividade.";
  } else if (days >= 180) {
    gapValue = 1;
    gapReason = `${days} dias sem atividade.`;
  } else if (days >= 90) {
    gapValue = 0.6;
    gapReason = `${days} dias sem atividade.`;
  } else if (days >= 45) {
    gapValue = 0.3;
    gapReason = `${days} dias sem atividade.`;
  }
  factors.push({
    name: "Inatividade",
    value: gapValue,
    weight: weights.inactivityGap,
    reason: gapReason,
  });

  // 4. Cuidado contínuo amplifica (abandonar tratamento que exige retorno é grave).
  factors.push({
    name: "Cuidado continuado",
    value: continuity ? 1 : 0,
    weight: weights.continuityCare,
    reason: continuity
      ? `${data.specialty} exige acompanhamento — abandono tem impacto clínico.`
      : "Atendimento pontual, sem necessidade de retorno contínuo.",
  });

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const raw = factors.reduce((s, f) => s + f.value * f.weight, 0) / totalWeight;
  const score = Math.round(raw * 100);
  const band: AbandonmentResult["band"] =
    score >= 60 ? "high" : score >= 35 ? "medium" : "low";

  return { score, band, reachable: data.hasContact, factors };
}
