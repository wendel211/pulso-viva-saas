import "server-only";
import { and, eq, desc, count } from "drizzle-orm";

import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type UserActivity = {
  /** Acesso anterior ao atual (penúltimo login), se houver. */
  lastLoginAt: Date | null;
  /** Total de logins registrados para o usuário. */
  loginCount: number;
};

/** Atividade de login/uso do usuário atual, a partir da trilha de auditoria. */
export async function getUserActivity(): Promise<UserActivity> {
  const session = await verifySession();

  const [logins, totalRow] = await Promise.all([
    db
      .select({ ts: auditLogs.timestamp })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.userId, session.userId),
          eq(auditLogs.action, "login"),
        ),
      )
      .orderBy(desc(auditLogs.timestamp))
      .limit(2),
    db
      .select({ value: count() })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.userId, session.userId),
          eq(auditLogs.action, "login"),
        ),
      ),
  ]);

  // logins[0] é o login da sessão atual; logins[1] é o acesso anterior.
  const lastLoginAt = logins[1]?.ts ?? null;

  return { lastLoginAt, loginCount: totalRow[0]?.value ?? 0 };
}
