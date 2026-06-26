import { describe, expect, it } from "vitest";

import {
  calculateAbandonmentRisk,
  isContinuityCare,
  type PatientCareData,
} from "./engine";

function base(over: Partial<PatientCareData> = {}): PatientCareData {
  return {
    noShowCount: 0,
    cancellationCount: 0,
    attendedCount: 1,
    daysSinceLastActivity: 10,
    hasFutureAppointment: true,
    specialty: "Cardiologia",
    hasContact: true,
    ...over,
  };
}

describe("isContinuityCare", () => {
  it("reconhece especialidades de cuidado contínuo", () => {
    expect(isContinuityCare("Psicologia")).toBe(true);
    expect(isContinuityCare("FISIOTERAPIA")).toBe(true);
    expect(isContinuityCare("Oftalmologia")).toBe(false);
    expect(isContinuityCare(null)).toBe(false);
  });
});

describe("calculateAbandonmentRisk", () => {
  it("aponta risco alto para quem sumiu do cuidado contínuo", () => {
    const r = calculateAbandonmentRisk(
      base({
        noShowCount: 2,
        cancellationCount: 1,
        hasFutureAppointment: false,
        daysSinceLastActivity: 200,
        specialty: "Psiquiatria",
      }),
    );
    expect(r.band).toBe("high");
    expect(r.score).toBeGreaterThanOrEqual(60);
  });

  it("aponta risco baixo para paciente ativo e em dia", () => {
    const r = calculateAbandonmentRisk(base());
    expect(r.band).toBe("low");
  });

  it("marca reachable conforme o contato", () => {
    expect(calculateAbandonmentRisk(base({ hasContact: false })).reachable).toBe(false);
    expect(calculateAbandonmentRisk(base({ hasContact: true })).reachable).toBe(true);
  });

  it("ausência de retorno agendado aumenta o risco", () => {
    const comRetorno = calculateAbandonmentRisk(base({ hasFutureAppointment: true }));
    const semRetorno = calculateAbandonmentRisk(base({ hasFutureAppointment: false }));
    expect(semRetorno.score).toBeGreaterThan(comRetorno.score);
  });

  it("mantém o score entre 0 e 100", () => {
    const r = calculateAbandonmentRisk(
      base({ noShowCount: 99, daysSinceLastActivity: 9999, hasFutureAppointment: false }),
    );
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
