import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { decrypt, getSessionCookie } from "./session";

/**
 * Data Access Layer — centraliza a verificação de sessão e autorização
 * próximo à fonte de dados (recomendação de segurança do Next.js 16).
 * `cache` memoiza o resultado durante o mesmo render pass.
 */
export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return {
    isAuth: true as const,
    userId: session.userId,
    organizationId: session.organizationId,
    role: session.role,
  };
});

/** Retorna apenas os campos seguros do usuário atual (DTO). */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        organizationId: users.organizationId,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return rows[0] ?? null;
  } catch {
    return null;
  }
});
