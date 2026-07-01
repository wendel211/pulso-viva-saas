"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointments, attendanceEvents, auditLogs } from "@/db/schema";
import { verifyConfirmToken } from "@/lib/confirm/token";

export type ConfirmResult = {
  ok: boolean;
  status?: "confirmed" | "cancelled";
  message: string;
};

/** Só permite ação enquanto o agendamento ainda está pendente. */
const ACTIONABLE = new Set(["scheduled", "rescheduled", "confirmed"]);

async function apply(
  token: string,
  next: "confirmed" | "cancelled",
): Promise<ConfirmResult> {
  const payload = await verifyConfirmToken(token);
  if (!payload) {
    return { ok: false, message: "Link inválido ou expirado." };
  }

  const rows = await db
    .select({ status: appointments.status, requestId: appointments.requestId })
    .from(appointments)
    .where(
      and(
        eq(appointments.id, payload.appointmentId),
        eq(appointments.organizationId, payload.organizationId),
      ),
    )
    .limit(1);

  const current = rows[0];
  if (!current) {
    return { ok: false, message: "Agendamento não encontrado." };
  }
  if (!ACTIONABLE.has(current.status)) {
    return {
      ok: false,
      message: "Este agendamento não pode mais ser alterado.",
    };
  }

  await db
    .update(appointments)
    .set({ status: next })
    .where(eq(appointments.id, payload.appointmentId));

  // Registra o evento de comparecimento (alimenta risco/histórico).
  await db.insert(attendanceEvents).values({
    organizationId: payload.organizationId,
    type: next === "confirmed" ? "confirmation" : "cancellation",
    occurredAt: new Date(),
    status: next,
  });

  await db.insert(auditLogs).values({
    organizationId: payload.organizationId,
    action: next === "confirmed" ? "patient_confirm" : "patient_cancel",
    resource: `appointment:${payload.appointmentId}`,
  });

  revalidatePath("/dashboard/confirmacoes");
  revalidatePath("/dashboard");

  return {
    ok: true,
    status: next,
    message:
      next === "confirmed"
        ? "Presença confirmada. Obrigado!"
        : "Consulta cancelada. A vaga será oferecida a outro paciente.",
  };
}

export async function confirmByToken(token: string): Promise<ConfirmResult> {
  return apply(token, "confirmed");
}

export async function cancelByToken(token: string): Promise<ConfirmResult> {
  return apply(token, "cancelled");
}
