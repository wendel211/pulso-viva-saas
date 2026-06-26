/**
 * Perfil de operação da organização. O mesmo motor serve clínica privada e
 * SUS; muda apenas o enquadramento das métricas e a linguagem.
 */
export type Segment = "publico" | "privado";

export const DEFAULT_SEGMENT: Segment = "privado";
export const DEFAULT_SLOT_VALUE_CENTS = 15000; // R$ 150,00

export type SegmentLabels = {
  impactTitle: string;
  reactivationTitle: string;
  recoveredSlots: string;
  avoidedNoShows: string;
  capacity: string;
  preservedCost: string;
  costHint: string;
};

const PRIVADO: SegmentLabels = {
  impactTitle: "Resultado financeiro",
  reactivationTitle: "Reativação de pacientes",
  recoveredSlots: "Vagas recuperadas",
  avoidedNoShows: "Faltas evitadas",
  capacity: "Ocupação da agenda",
  preservedCost: "Receita recuperada (estimada)",
  costHint: "Vagas recuperadas + faltas evitadas × valor médio da vaga.",
};

const PUBLICO: SegmentLabels = {
  impactTitle: "Impacto sustentável",
  reactivationTitle: "Busca ativa",
  recoveredSlots: "Vagas recuperadas",
  avoidedNoShows: "Faltas evitadas",
  capacity: "Capacidade aproveitada",
  preservedCost: "Custo público preservado (estimado)",
  costHint: "Vagas recuperadas + faltas evitadas × valor médio da vaga.",
};

export function segmentLabels(segment: Segment): SegmentLabels {
  return segment === "publico" ? PUBLICO : PRIVADO;
}

export function segmentName(segment: Segment): string {
  return segment === "publico" ? "Público / SUS" : "Clínica privada";
}
