import { beforeAll, describe, expect, it } from "vitest";

import { createConfirmToken, verifyConfirmToken } from "./token";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-para-confirmacao-1234567890";
});

describe("token de confirmação", () => {
  it("faz round-trip: assina e verifica o mesmo payload", async () => {
    const token = await createConfirmToken({
      appointmentId: "apt-1",
      organizationId: "org-1",
    });
    const payload = await verifyConfirmToken(token);
    expect(payload).toEqual({ appointmentId: "apt-1", organizationId: "org-1" });
  });

  it("rejeita token adulterado", async () => {
    const token = await createConfirmToken({
      appointmentId: "apt-1",
      organizationId: "org-1",
    });
    const tampered = token.slice(0, -3) + "abc";
    expect(await verifyConfirmToken(tampered)).toBeNull();
  });

  it("rejeita string que não é token", async () => {
    expect(await verifyConfirmToken("nao-e-um-jwt")).toBeNull();
  });

  it("rejeita token assinado com outro segredo", async () => {
    const token = await createConfirmToken({
      appointmentId: "apt-1",
      organizationId: "org-1",
    });
    process.env.SESSION_SECRET = "outro-segredo-completamente-diferente";
    expect(await verifyConfirmToken(token)).toBeNull();
    process.env.SESSION_SECRET = "test-secret-para-confirmacao-1234567890";
  });
});
