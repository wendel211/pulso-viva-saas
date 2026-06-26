"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { actionTasks, auditLogs } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type ReactivationState =
  | { ok?: boolean; message?: string }
  | undefined;

/**
 * Gera uma tarefa de reativação / busca ativa para um paciente em risco de
 * abandono (RF10 reaproveitado). A tarefa cai na Lista de ações para a
 * recepção (clínica) ou o Agente Comunitário (SUS) acionar.
 */
export async function createReactivationTask(
  _state: ReactivationState,
  formData: FormData,
): Promise<ReactivationState> {
  const session = await verifySession();
  if (!["org_manager", "operator", "admin_pulsoviva"].includes(session.role)) {
    return { ok: false, message: "Sem permissão para gerar tarefas." };
  }

  const patientId = formData.get("patientId") as string | null;
  const patientName = formData.get("patientName") as string | null;
  if (!patientId) {
    return { ok: false, message: "Paciente inválido." };
  }

  const orgId = session.organizationId;

  await db.insert(actionTasks).values({
    organizationId: orgId,
    type: "reativacao",
    patientId,
    recommendation: `Contatar ${patientName ?? "paciente"} para retomar o acompanhamento (risco de abandono).`,
    status: "pending",
    assigneeId: session.userId,
  });

  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.userId,
    action: "create_reactivation_task",
    resource: `patient:${patientId}`,
  });

  revalidatePath("/dashboard/reativacao");
  revalidatePath("/dashboard/acoes");

  return { ok: true, message: "Tarefa de reativação criada." };
}
