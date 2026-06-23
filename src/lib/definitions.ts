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

/** Schema de convite de usuário (RF12). */
export const InviteUserSchema = z.object({
  name: z.string().min(2, { message: "Informe o nome." }).trim(),
  email: z.string().email({ message: "Informe um e-mail válido." }).trim(),
  role: z.enum(["org_manager", "operator", "analyst", "dpo_auditor"], {
    message: "Selecione um papel válido.",
  }),
});

export type InviteUserState =
  | {
      ok?: boolean;
      errors?: {
        name?: string[];
        email?: string[];
        role?: string[];
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
