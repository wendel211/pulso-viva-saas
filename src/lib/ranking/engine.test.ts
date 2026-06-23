import { describe, expect, it } from "vitest";

import { rankCandidates, type CandidateInput } from "./engine";

function makeCandidate(over: Partial<CandidateInput>): CandidateInput {
  return {
    requestId: Math.random().toString(36).slice(2),
    patientId: Math.random().toString(36).slice(2),
    patientName: "Paciente",
    contact: "(11) 90000-0000",
    specialty: "Cardiologia",
    requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    priority: "normal",
    riskScore: 20,
    ...over,
  };
}

const DAY = 24 * 60 * 60 * 1000;

describe("rankCandidates", () => {
  it("ordena do maior para o menor rankScore", () => {
    const ranked = rankCandidates(
      [
        makeCandidate({ priority: "baixa" }),
        makeCandidate({ priority: "urgente" }),
      ],
      "Cardiologia",
    );

    expect(ranked).toHaveLength(2);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].rankScore).toBeGreaterThanOrEqual(ranked[i].rankScore);
    }
  });

  it("prioriza quem espera há mais tempo", () => {
    const antigo = makeCandidate({
      patientName: "Antigo",
      requestedAt: new Date(Date.now() - 120 * DAY),
    });
    const recente = makeCandidate({
      patientName: "Recente",
      requestedAt: new Date(Date.now() - 2 * DAY),
    });

    const ranked = rankCandidates([recente, antigo], "Cardiologia");
    expect(ranked[0].patientName).toBe("Antigo");
  });

  it("penaliza candidato sem contato", () => {
    const semContato = makeCandidate({ patientName: "SemContato", contact: null });
    const comContato = makeCandidate({ patientName: "ComContato" });

    const ranked = rankCandidates([semContato, comContato], "Cardiologia");
    const sem = ranked.find((c) => c.patientName === "SemContato")!;
    const com = ranked.find((c) => c.patientName === "ComContato")!;
    expect(com.rankScore).toBeGreaterThan(sem.rankScore);
    expect(sem.hasContact).toBe(false);
  });

  it("dá prioridade maior a 'urgente' que a 'baixa'", () => {
    const urgente = makeCandidate({ patientName: "Urgente", priority: "urgente" });
    const baixa = makeCandidate({ patientName: "Baixa", priority: "baixa" });

    const ranked = rankCandidates([baixa, urgente], "Cardiologia");
    expect(ranked[0].patientName).toBe("Urgente");
  });

  it("converte risco baixo em alta confiabilidade", () => {
    const [c] = rankCandidates([makeCandidate({ riskScore: 10 })], "Cardiologia");
    expect(c.reliabilityScore).toBe(90);
  });
});
