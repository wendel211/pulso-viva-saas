"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";

export async function login(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  // 1. Validação dos campos no servidor.
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  // 2. Busca o usuário e confere a senha.
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = rows[0];
  const passwordOk = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  // Mensagem genérica para não revelar se o e-mail existe.
  if (!user || !passwordOk) {
    return { message: "Credenciais inválidas. Verifique e tente novamente." };
  }

  // 3. Cria a sessão (apenas dados mínimos, sem PII).
  await createSession({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
  });

  // 4. Registra log de auditoria (LGPD — RF16).
  await db.insert(auditLogs).values({
    organizationId: user.organizationId,
    userId: user.id,
    action: "login",
    resource: "session",
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
