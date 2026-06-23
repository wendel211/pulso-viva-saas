import { describe, expect, it } from "vitest";

import { calculateRisk } from "./baseline";

describe("calculateRisk", () => {
  it("classifica risco alto quando há vários fatores agravantes", () => {
    const result = calculateRisk({
      contact: null,
      status: "scheduled",
      requestedAt: new Date("2026-01-01"),
      scheduledAt: new Date("2026-06-01"), // ~150 dias de espera
      noShowCount: 3,
      cancellationCount: 1,
      specialty: "Psicologia",
    });

    expect(result.band).toBe("high");
    expect(result.score).toBeGreaterThanOrEqual(65);
  });

  it("classifica risco baixo para paciente confiável", () => {
    const result = calculateRisk({
      contact: "(11) 99999-0000",
      status: "confirmed",
      requestedAt: new Date("2026-05-25"),
      scheduledAt: new Date("2026-06-01"), // espera curta
      noShowCount: 0,
      cancellationCount: 0,
      specialty: "Cardiologia",
    });

    expect(result.band).toBe("low");
    expect(result.score).toBeLessThan(35);
  });

  it("mantém o score entre 0 e 100 e devolve fatores explicativos", () => {
    const result = calculateRisk({
      contact: null,
      status: "scheduled",
      noShowCount: 10,
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.factors.length).toBeGreaterThan(0);
    for (const f of result.factors) {
      expect(typeof f.reason).toBe("string");
      expect(f.reason.length).toBeGreaterThan(0);
    }
  });

  it("trata 'sem contato' como fator de maior peso", () => {
    const semContato = calculateRisk({ contact: null, status: "confirmed" });
    const comContato = calculateRisk({
      contact: "(11) 90000-0000",
      status: "confirmed",
    });

    expect(semContato.score).toBeGreaterThan(comContato.score);
  });
});
