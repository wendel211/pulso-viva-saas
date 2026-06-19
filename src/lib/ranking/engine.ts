/**
 * Motor de ranking de encaixe (doc §12, RF09).
 *
 * Para uma vaga ociosa (cancelamento, desistência ou horário aberto),
 * ordena os pacientes em fila pela combinação de 4 critérios:
 *   1. Tempo de espera        — quanto mais tempo, maior prioridade
 *   2. Prioridade explícita   — campo da solicitação (urgente > alta > normal > baixa)
 *   3. Risco de falta         — preferimos quem tem menor chance de faltar
 *   4. Contato disponível     — só encaixamos quem conseguimos chamar
 *
 * Pesos padrão configuráveis por organização (RF17 futuro).
 */

export type RankingWeights = {
  waitTime: number;     // 0-1
  priority: number;     // 0-1
  reliability: number;  // 0-1  (inverso do risco de falta)
  contact: number;      // 0-1
};

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  waitTime: 0.35,
  priority: 0.30,
  reliability: 0.25,
  contact: 0.10,
};

export type CandidateInput = {
  requestId: string;
  patientId: string;
  patientName: string | null;
  contact: string | null;
  specialty: string | null;
  requestedAt: Date | null;
  priority: string | null;
  riskScore: number | null; // 0-100, null = não calculado ainda
};

export type RankedCandidate = CandidateInput & {
  rankScore: number;      // 0-100, quanto maior = melhor candidato para encaixe
  waitDays: number;
  priorityLevel: number;  // 0-3
  reliabilityScore: number; // 0-100 (100 - riskScore)
  hasContact: boolean;
  reasons: string[];
};

const PRIORITY_MAP: Record<string, number> = {
  urgente: 3,
  alta: 2,
  normal: 1,
  baixa: 0,
};

function parsePriority(raw: string | null): number {
  if (!raw) return 1;
  return PRIORITY_MAP[raw.toLowerCase().trim()] ?? 1;
}

export function rankCandidates(
  candidates: CandidateInput[],
  vacancySpecialty: string | null,
  weights = DEFAULT_RANKING_WEIGHTS,
): RankedCandidate[] {
  const now = Date.now();

  // Calcula métricas brutas para normalização.
  const waitDaysAll = candidates.map((c) =>
    c.requestedAt
      ? (now - c.requestedAt.getTime()) / (1000 * 60 * 60 * 24)
      : 0,
  );
  const maxWait = Math.max(...waitDaysAll, 1);

  const ranked: RankedCandidate[] = candidates.map((c, i) => {
    const waitDays = waitDaysAll[i];
    const priorityLevel = parsePriority(c.priority);
    const reliabilityScore = c.riskScore != null ? 100 - c.riskScore : 50;
    const hasContact = Boolean(c.contact && c.contact.trim() !== "");

    // Valores normalizados 0-1.
    const waitNorm = waitDays / maxWait;
    const priorityNorm = priorityLevel / 3;
    const reliabilityNorm = reliabilityScore / 100;
    const contactNorm = hasContact ? 1 : 0;

    const rawScore =
      waitNorm * weights.waitTime +
      priorityNorm * weights.priority +
      reliabilityNorm * weights.reliability +
      contactNorm * weights.contact;

    const rankScore = Math.round(rawScore * 100);

    // Motivos legíveis para exibir na UI.
    const reasons: string[] = [];
    if (waitDays >= 90) reasons.push(`${Math.round(waitDays)} dias em fila`);
    else if (waitDays >= 30) reasons.push(`${Math.round(waitDays)} dias esperando`);
    if (priorityLevel >= 2) reasons.push(`Prioridade ${c.priority}`);
    if (reliabilityScore >= 75) reasons.push("Baixo risco de falta");
    if (!hasContact) reasons.push("⚠ Sem contato cadastrado");
    if (
      vacancySpecialty &&
      c.specialty?.toLowerCase() === vacancySpecialty.toLowerCase()
    ) {
      reasons.push("Especialidade compatível");
    }

    return {
      ...c,
      rankScore,
      waitDays: Math.round(waitDays),
      priorityLevel,
      reliabilityScore,
      hasContact,
      reasons,
    };
  });

  // Ordena do maior para o menor rank; desempate por espera.
  return ranked.sort((a, b) =>
    b.rankScore !== a.rankScore
      ? b.rankScore - a.rankScore
      : b.waitDays - a.waitDays,
  );
}
