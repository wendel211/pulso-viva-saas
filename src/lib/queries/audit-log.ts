import "server-only";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type AuditLogRow = {
  id: string;
  action: string;
  resource: string | null;
  userName: string | null;
  metadata: unknown;
  timestamp: Date;
};

const ALLOWED_ROLES = ["org_manager", "admin_pulsoviva", "dpo_auditor"];

/**
 * Trilha de auditoria (RF16, doc §15) — leitura restrita a gestor,
 * administrador e DPO/Auditor. Eventos sensíveis: login, import, export,
 * mudança de status e encaixe.
 */
export async function getAuditLog(): Promise<AuditLogRow[]> {
  const session = await verifySession();
  if (!ALLOWED_ROLES.includes(session.role)) {
    return [];
  }

  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      resource: auditLogs.resource,
      userName: users.name,
      metadata: auditLogs.metadata,
      timestamp: auditLogs.timestamp,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(eq(auditLogs.organizationId, session.organizationId))
    .orderBy(desc(auditLogs.timestamp))
    .limit(200);
}

export async function canViewAuditLog(): Promise<boolean> {
  const session = await verifySession();
  return ALLOWED_ROLES.includes(session.role);
}
