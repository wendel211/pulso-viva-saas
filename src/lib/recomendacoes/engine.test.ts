import { describe, expect, it } from "vitest";

import { buildRecommendations, type RecommendationInput } from "./engine";

function input(over: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    openSlots: 0,
    highRiskAppointments: 0,
    criticalBottleneck: null,
    abandonmentHigh: 0,
    equityWorst: null,
    slotValueCents: 15000,
    segment: "privado",
    ...over,
  };
}

describe("buildRecommendations", () => {
  it("não gera ações quando não há sinais", () => {
    expect(buildRecommendations(input())).toHaveLength(0);
  });

  it("recomenda encaixe com impacto em R$ no perfil privado", () => {
    const [rec] = buildRecommendations(input({ openSlots: 6 }));
    expect(rec.category).toBe("Encaixe");
    expect(rec.priority).toBe("high");
    expect(rec.impact).toContain("R$");
    expect(rec.href).toBe("/dashboard/encaixe");
  });

  it("usa linguagem de acesso no perfil público", () => {
    const [rec] = buildRecommendations(
      input({ openSlots: 3, segment: "publico" }),
    );
    expect(rec.impact).toContain("atendimento");
    expect(rec.impact).not.toContain("R$");
  });

  it("prioriza ações de alta prioridade no topo", () => {
    const recs = buildRecommendations(
      input({
        openSlots: 2, // medium
        criticalBottleneck: { specialty: "Cardiologia", projection90: 120, queueTotal: 60 }, // high
      }),
    );
    expect(recs[0].priority).toBe("high");
    expect(recs[0].category).toBe("Capacidade");
  });

  it("recomenda busca ativa/recall quando há abandono", () => {
    const recs = buildRecommendations(input({ abandonmentHigh: 12 }));
    const rec = recs.find((r) => r.category === "Continuidade")!;
    expect(rec.priority).toBe("high");
    expect(rec.href).toBe("/dashboard/reativacao");
  });

  it("só recomenda equidade quando a disparidade é relevante", () => {
    expect(
      buildRecommendations(
        input({ equityWorst: { dimension: "Faixa etária", group: "60+", ratio: 1.2 } }),
      ),
    ).toHaveLength(0);

    const recs = buildRecommendations(
      input({ equityWorst: { dimension: "Faixa etária", group: "60+", ratio: 2.4 } }),
    );
    expect(recs.find((r) => r.category === "Equidade")).toBeTruthy();
  });
});
