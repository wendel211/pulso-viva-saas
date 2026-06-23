"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { InviteUserSchema, type InviteUserState } from "@/lib/definitions";

const MANAGE_ROLES = ["org_manager", "admin_pulsoviva"];
const VALID_ROLES = [
  "org_manager",
  "operator",
  "analyst",
  "dpo_auditor",
] as const;

/** Convida (cria) um novo usuário na organização (RF12). */
export async function inviteUser(
  _state: InviteUserState,
  formData: FormData,
): Promise<InviteUserState> {
  const session = await verifySession();
  if (!MANAGE_ROLES.includes(session.role)) {
    return { message: "Apenas gestores podem convidar usuários." };
  }

  const validated = InviteUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, role } = validated.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { message: "Já existe um usuário com este e-mail." };
  }

  // Senha provisória — em produção, enviar link de definição de senha por e-mail.
  const tempPassword = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await db.insert(users).values({
    organizationId: session.organizationId,
    name,
    email,
    passwordHash,
    role: role as (typeof VALID_ROLES)[number],
  });

  await db.insert(auditLogs).values({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "invite_user",
    resource: `user:${email}`,
    metadata: { role },
  });

  revalidatePath("/dashboard/usuarios");
  return {
    ok: true,
    message: `Usuário criado. Senha provisória: ${tempPassword}`,
  };
}

export type UpdateRoleState = { ok?: boolean; message?: string } | undefined;

/** Atualiza o papel de um usuário da organização. */
export async function updateUserRole(
  _state: UpdateRoleState,
  formData: FormData,
): Promise<UpdateRoleState> {
  const session = await verifySession();
  if (!MANAGE_ROLES.includes(session.role)) {
    return { ok: false, message: "Sem permissão." };
  }

  const userId = formData.get("userId") as string | null;
  const role = formData.get("role") as string | null;

  if (!userId || !role || !VALID_ROLES.includes(role as never)) {
    return { ok: false, message: "Dados inválidos." };
  }

  // Impede o gestor de remover o próprio papel de gestão por engano.
  if (userId === session.userId && role !== "org_manager") {
    return { ok: false, message: "Você não pode alterar seu próprio papel." };
  }

  await db
    .update(users)
    .set({ role: role as (typeof VALID_ROLES)[number] })
    .where(
      and(
        eq(users.id, userId),
        eq(users.organizationId, session.organizationId),
        ne(users.id, session.userId),
      ),
    );

  await db.insert(auditLogs).values({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "update_user_role",
    resource: `user:${userId}`,
    metadata: { role },
  });

  revalidatePath("/dashboard/usuarios");
  return { ok: true, message: "Papel atualizado." };
}

/** Ativa/desativa um usuário da organização. */
export async function toggleUserStatus(
  _state: UpdateRoleState,
  formData: FormData,
): Promise<UpdateRoleState> {
  const session = await verifySession();
  if (!MANAGE_ROLES.includes(session.role)) {
    return { ok: false, message: "Sem permissão." };
  }

  const userId = formData.get("userId") as string | null;
  const nextStatus = formData.get("nextStatus") as string | null;

  if (!userId || !nextStatus || userId === session.userId) {
    return { ok: false, message: "Operação inválida." };
  }

  await db
    .update(users)
    .set({ status: nextStatus })
    .where(
      and(
        eq(users.id, userId),
        eq(users.organizationId, session.organizationId),
      ),
    );

  await db.insert(auditLogs).values({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "toggle_user_status",
    resource: `user:${userId}`,
    metadata: { status: nextStatus },
  });

  revalidatePath("/dashboard/usuarios");
  return { ok: true, message: "Status atualizado." };
}
