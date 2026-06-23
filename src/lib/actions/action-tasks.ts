"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { actionTasks, auditLogs } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type UpdateTaskState = { ok?: boolean; message?: string } | undefined;

const VALID_STATUSES = [
  "pending",
  "contacted",
  "confirmed",
  "rescheduled",
  "fitted",
  "refused",
  "not_found",
] as const;

/** Atualiza o status de uma ActionTask (RF10) e registra audit log. */
export async function updateActionTaskStatus(
  _state: UpdateTaskState,
  formData: FormData,
): Promise<UpdateTaskState> {
  const session = await verifySession();
  if (!["org_manager", "operator", "admin_pulsoviva"].includes(session.role)) {
    return { ok: false, message: "Sem permissão para atualizar status." };
  }

  const taskId = formData.get("taskId") as string | null;
  const status = formData.get("status") as string | null;

  if (!taskId || !status || !VALID_STATUSES.includes(status as never)) {
    return { ok: false, message: "Dados inválidos." };
  }

  const orgId = session.organizationId;

  await db
    .update(actionTasks)
    .set({ status: status as (typeof VALID_STATUSES)[number] })
    .where(
      and(eq(actionTasks.id, taskId), eq(actionTasks.organizationId, orgId)),
    );

  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.userId,
    action: "update_action_status",
    resource: `action_task:${taskId}`,
    metadata: { status },
  });

  revalidatePath("/dashboard/acoes");
  return { ok: true, message: "Status atualizado." };
}
