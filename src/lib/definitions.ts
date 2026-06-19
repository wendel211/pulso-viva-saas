import * as z from "zod";

/** Schema de login (RF01). */
export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido." }).trim(),
  password: z
    .string()
    .min(1, { message: "Informe sua senha." })
    .trim(),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

/** Dados mínimos da sessão guardados no cookie (sem PII — doc §12). */
export type SessionPayload = {
  userId: string;
  organizationId: string;
  role: string;
  expiresAt: Date;
};
