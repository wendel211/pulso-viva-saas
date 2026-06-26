import { describe, expect, it } from "vitest";

import { ageBand, computeEquity, type EquityRecord } from "./engine";

describe("ageBand", () => {
  it("classifica faixas etárias", () => {
    expect(ageBand(5)).toBe("0–17");
    expect(ageBand(25)).toBe("18–39");
    expect(ageBand(50)).toBe("40–59");
    expect(ageBand(70)).toBe("60+");
    expect(ageBand(null)).toBeNull();
  });
});

function rec(over: Partial<EquityRecord>): EquityRecord {
  return {
    ageBand: "18–39",
    specialty: "Cardiologia",
    territory: "São Paulo",
    priority: "normal",
    waitDays: 10,
    ...over,
  };
}

describe("computeEquity", () => {
  it("dá índice alto quando a espera é equilibrada entre grupos", () => {
    const records: EquityRecord[] = [];
    for (let i = 0; i < 5; i++) records.push(rec({ ageBand: "18–39", waitDays: 10 }));
    for (let i = 0; i < 5; i++) records.push(rec({ ageBand: "60+", waitDays: 10 }));
    const r = computeEquity(records);
    expect(r.equityIndex).toBeGreaterThanOrEqual(90);
  });

  it("dá índice menor quando um grupo espera muito mais", () => {
    const records: EquityRecord[] = [];
    for (let i = 0; i < 5; i++) records.push(rec({ ageBand: "18–39", waitDays: 5 }));
    for (let i = 0; i < 5; i++) records.push(rec({ ageBand: "60+", waitDays: 80 }));
    const r = computeEquity(records);
    expect(r.equityIndex).toBeLessThan(70);

    const faixa = r.dimensions.find((d) => d.key === "ageBand")!;
    expect(faixa.mostPenalized).toBe("60+");
    expect(faixa.disparityRatio).toBeGreaterThan(1.5);
  });

  it("ignora grupos pequenos demais (< 3) na comparação", () => {
    const records: EquityRecord[] = [
      rec({ specialty: "Cardiologia", waitDays: 10 }),
      rec({ specialty: "Cardiologia", waitDays: 10 }),
      rec({ specialty: "Cardiologia", waitDays: 10 }),
      rec({ specialty: "Raríssima", waitDays: 500 }), // 1 só → ignorado
    ];
    const r = computeEquity(records);
    const esp = r.dimensions.find((d) => d.key === "specialty");
    // Só Cardiologia qualifica (3+), logo não há comparação → dimensão omitida.
    expect(esp).toBeUndefined();
  });

  it("calcula a espera média geral", () => {
    const r = computeEquity([
      rec({ waitDays: 10 }),
      rec({ waitDays: 20 }),
      rec({ waitDays: 30 }),
    ]);
    expect(r.overallAvgWaitDays).toBe(20);
    expect(r.totalRecords).toBe(3);
  });
});
