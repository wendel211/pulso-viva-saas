"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointments, actionTasks, auditLogs } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type FitActionState =
  | { ok?: boolean; message?: string }
  | undefined;

/**
 * Registra que um paciente foi encaixado em uma vaga ociosa (RF09/RF10).
 * Marca a vaga como scheduled novamente e cria um ActionTask de encaixe.
 */
export async function fitPatient(
  _state: FitActionState,
  formData: FormData,
): Promise<FitActionState> {
  const session = await verifySession();
  if (!["org_manager", "operator", "admin_pulsoviva"].includes(session.role)) {
    return { ok: false, message: "Sem permissão para registrar encaixe." };
  }

  const appointmentId = formData.get("appointmentId") as string | null;
  const patientId = formData.get("patientId") as string | null;
  const requestId = formData.get("requestId") as string | null;
  const patientName = formData.get("patientName") as string | null;

  if (!appointmentId || !patientId) {
    return { ok: false, message: "Dados de encaixe incompletos." };
  }

  const orgId = session.organizationId;

  // Vincula o agendamento à nova solicitação e muda status para scheduled.
  await db
    .update(appointments)
    .set({
      requestId: requestId ?? undefined,
      status: "scheduled",
    })
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.organizationId, orgId),
      ),
    );

  // Cria uma tarefa operacional de confirmação (RF10).
  await db.insert(actionTasks).values({
    organizationId: orgId,
    type: "encaixe",
    patientId,
    recommendation: `Contatar ${patientName ?? "paciente"} para confirmar encaixe.`,
    status: "pending",
    assigneeId: session.userId,
  });

  // Audit log (RF16).
  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.userId,
    action: "fit_patient",
    resource: `appointment:${appointmentId}`,
    metadata: { patientId, requestId },
  });

  revalidatePath("/dashboard/encaixe");
  revalidatePath("/dashboard");

  return { ok: true, message: `Encaixe registrado. Tarefa de confirmação criada.` };
}
