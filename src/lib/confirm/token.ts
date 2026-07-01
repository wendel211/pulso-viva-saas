import { SignJWT, jwtVerify } from "jose";

/**
 * Token de confirmação de consulta (PulsoViva Conecta).
 *
 * Gera um link seguro que o operador envia ao paciente (WhatsApp/SMS) para
 * confirmar ou cancelar a consulta — sem exigir login. O token carrega apenas
 * o id do agendamento e da organização, assinado com HS256.
 */

export type ConfirmPayload = {
  appointmentId: string;
  organizationId: string;
};

function key() {
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function createConfirmToken(
  payload: ConfirmPayload,
): Promise<string> {
  return new SignJWT({ ...payload, purpose: "confirm" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
}

export async function verifyConfirmToken(
  token: string,
): Promise<ConfirmPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key(), {
      algorithms: ["HS256"],
    });
    if (payload.purpose !== "confirm") return null;
    const { appointmentId, organizationId } = payload as Record<string, unknown>;
    if (typeof appointmentId !== "string" || typeof organizationId !== "string") {
      return null;
    }
    return { appointmentId, organizationId };
  } catch {
    return null;
  }
}
