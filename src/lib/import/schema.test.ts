import { describe, expect, it } from "vitest";

import { canonicalizeHeader, STATUS_MAP, ImportRowSchema } from "./schema";

describe("canonicalizeHeader", () => {
  it("reconhece cabeçalhos com acento e caixa diferentes", () => {
    expect(canonicalizeHeader("Especialidade")).toBe("specialty");
    expect(canonicalizeHeader("ESPECIALIDADE")).toBe("specialty");
    expect(canonicalizeHeader("Paciente")).toBe("patientName");
    expect(canonicalizeHeader("Unidade")).toBe("unit");
    expect(canonicalizeHeader("Situação")).toBe("status");
  });

  it("aceita sinônimos definidos nos aliases", () => {
    expect(canonicalizeHeader("nome do paciente")).toBe("patientName");
    expect(canonicalizeHeader("telefone")).toBe("contact");
    expect(canonicalizeHeader("data_agendamento")).toBe("scheduledAt");
  });

  it("devolve null para cabeçalho desconhecido", () => {
    expect(canonicalizeHeader("coluna_inexistente")).toBeNull();
  });
});

describe("STATUS_MAP", () => {
  it("mapeia status textual para o enum interno", () => {
    expect(STATUS_MAP["faltou"]).toBe("no_show");
    expect(STATUS_MAP["confirmado"]).toBe("confirmed");
    expect(STATUS_MAP["cancelado"]).toBe("cancelled");
  });
});

describe("ImportRowSchema", () => {
  it("coage idade e data corretamente", () => {
    const parsed = ImportRowSchema.safeParse({
      patientName: "  Maria Silva ",
      age: "45",
      scheduledAt: "2026-06-01",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.patientName).toBe("Maria Silva");
      expect(parsed.data.age).toBe(45);
      expect(parsed.data.scheduledAt).toBeInstanceOf(Date);
    }
  });

  it("rejeita idade fora do intervalo", () => {
    const parsed = ImportRowSchema.safeParse({ age: "999" });
    expect(parsed.success).toBe(false);
  });
});
