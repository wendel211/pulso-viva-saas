/**
 * Motor de risco de falta — fase baseline (doc §12).
 *
 * Regras transparentes e explicáveis para funcionar sem histórico grande.
 * Cada fator tem um peso (0-100) e um valor calculado (0-1), contribuindo
 * proporcionalmente para o score final. Critério de evolução para ML:
 * dados históricos suficientes para medir acurácia/recall.
 */

export type RiskFactor = {
  name: string;
  /** Contribuição calculada (0-1). */
  value: number;
  /** Peso do fator no score final (0-1). */
  weight: number;
  /** Texto humano explicando a contribuição. */
  reason: string;
};

export type RiskResult = {
  /** Score de risco de falta, 0-100 (maior = mais risco). */
  score: number;
  band: "low" | "medium" | "high";
  factors: RiskFactor[];
};

export type AppointmentData = {
  scheduledAt?: Date | null;
  requestedAt?: Date | null;
  status?: string | null;
  contact?: string | null;
  noShowCount?: number; // faltas anteriores do paciente
  cancellationCount?: number;
  specialty?: string | null;
};

/** Pesos padrão — configuráveis futuramente por organização (RF17). */
export const DEFAULT_WEIGHTS = {
  noContact: 0.30,
  notConfirmed: 0.25,
  longWait: 0.20,
  priorNoShows: 0.20,
  highRiskSpecialty: 0.05,
} as const;

/** Especialidades com taxa historicamente alta de no-show (referência clínica). */
const HIGH_RISK_SPECIALTIES = new Set([
  "psicologia", "psiquiatria", "nutrição", "fonoaudiologia",
  "fisioterapia", "dermatologia",
]);

export function calculateRisk(
  apt: AppointmentData,
  weights = DEFAULT_WEIGHTS,
): RiskResult {
  const factors: RiskFactor[] = [];

  // Fator 1: sem contato (impede confirmação ativa).
  const noContact = !apt.contact || apt.contact.trim() === "";
  factors.push({
    name: "Sem contato",
    value: noContact ? 1 : 0,
    weight: weights.noContact,
    reason: noContact
      ? "Paciente sem telefone — não é possível confirmar."
      : "Contato disponível para confirmação.",
  });

  // Fator 2: agendamento não confirmado.
  const notConfirmed =
    apt.status !== "confirmed" && apt.status !== "attended";
  factors.push({
    name: "Não confirmado",
    value: notConfirmed ? 1 : 0,
    weight: weights.notConfirmed,
    reason: notConfirmed
      ? "Agendamento ainda não confirmado pelo paciente."
      : "Paciente confirmou presença.",
  });

  // Fator 3: tempo de espera longo (solicitação → agendamento).
  let waitValue = 0;
  let waitReason = "Tempo de espera adequado.";
  if (apt.requestedAt && apt.scheduledAt) {
    const waitDays =
      (apt.scheduledAt.getTime() - apt.requestedAt.getTime()) /
      (1000 * 60 * 60 * 24);
    if (waitDays >= 120) {
      waitValue = 1;
      waitReason = `Espera de ${Math.round(waitDays)} dias — risco alto de desistência.`;
    } else if (waitDays >= 60) {
      waitValue = 0.6;
      waitReason = `Espera de ${Math.round(waitDays)} dias — risco moderado.`;
    } else if (waitDays >= 30) {
      waitValue = 0.3;
      waitReason = `Espera de ${Math.round(waitDays)} dias.`;
    }
  } else {
    waitValue = 0.2;
    waitReason = "Datas de solicitação ou agendamento ausentes.";
  }
  factors.push({
    name: "Tempo de espera",
    value: waitValue,
    weight: weights.longWait,
    reason: waitReason,
  });

  // Fator 4: histórico de faltas anteriores.
  const noShows = apt.noShowCount ?? 0;
  const cancels = apt.cancellationCount ?? 0;
  const historyValue = Math.min((noShows * 0.5 + cancels * 0.15), 1);
  factors.push({
    name: "Histórico de faltas",
    value: historyValue,
    weight: weights.priorNoShows,
    reason:
      noShows > 0
        ? `${noShows} falta(s) e ${cancels} cancelamento(s) anterior(es).`
        : "Sem faltas registradas anteriormente.",
  });

  // Fator 5: especialidade de alto risco.
  const isHighRisk =
    apt.specialty != null &&
    HIGH_RISK_SPECIALTIES.has(apt.specialty.toLowerCase().trim());
  factors.push({
    name: "Especialidade de risco",
    value: isHighRisk ? 1 : 0,
    weight: weights.highRiskSpecialty,
    reason: isHighRisk
      ? `${apt.specialty} apresenta taxa de no-show historicamente elevada.`
      : "Especialidade sem padrão de risco elevado.",
  });

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const rawScore =
    factors.reduce((s, f) => s + f.value * f.weight, 0) / totalWeight;

  const score = Math.round(rawScore * 100);
  const band: RiskResult["band"] =
    score >= 65 ? "high" : score >= 35 ? "medium" : "low";

  return { score, band, factors };
}
