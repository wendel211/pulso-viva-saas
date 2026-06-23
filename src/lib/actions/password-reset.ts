"use server";

import * as z from "zod";

const ResetSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido." }).trim(),
});

export type ResetState =
  | { ok?: boolean; error?: string }
  | undefined;

/**
 * Solicitação de recuperação de senha (RF01).
 *
 * MVP: o envio de e-mail ainda não está integrado, então sempre retornamos
 * uma mensagem neutra — sem revelar se o e-mail existe (evita enumeração de
 * usuários). Quando houver provedor de e-mail, basta disparar o link aqui.
 */
export async function requestPasswordReset(
  _state: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = ResetSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.email?.[0] };
  }

  // TODO: integrar provedor de e-mail e gerar token de redefinição.
  return { ok: true };
}
