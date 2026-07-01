import "server-only";
import { and, eq, gte, inArray } from "drizzle-orm";

import { db } from "@/db";
import { appointments, accessRequests, patients, units } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { createConfirmToken } from "@/lib/confirm/token";

export type ConfirmAppointmentView = {
  id: string;
  status: string;
  scheduledAt: Date | null;
  professional: string | null;
  specialty: string | null;
  unitName: string | null;
  patientName: string | null;
};

/**
 * Busca o agendamento para a página pública de confirmação. Não usa sessão —
 * a autorização vem do token (já verificado antes de chamar). O escopo por
 * organização evita acesso cruzado entre tenants.
 */
export async function getAppointmentForConfirm(
  appointmentId: string,
  organizationId: string,
): Promise<ConfirmAppointmentView | null> {
  const rows = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      scheduledAt: appointments.scheduledAt,
      professional: appointments.professional,
      specialty: accessRequests.specialty,
      unitName: units.name,
      patientName: patients.name,
    })
    .from(appointments)
    .leftJoin(accessRequests, eq(appointments.requestId, accessRequests.id))
    .leftJoin(patients, eq(accessRequests.patientId, patients.id))
    .leftJoin(units, eq(appointments.unitId, units.id))
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.organizationId, organizationId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export type UpcomingConfirmation = {
  appointmentId: string;
  patientName: string | null;
  contact: string | null;
  specialty: string | null;
  scheduledAt: Date | null;
  status: string;
  token: string;
};

/**
 * Lista de agendamentos futuros para o operador enviar confirmação.
 * Gera o token de cada um para montar o link/mensagem.
 */
export async function getUpcomingConfirmations(): Promise<UpcomingConfirmation[]> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({
      appointmentId: appointments.id,
      patientName: patients.name,
      contact: patients.contact,
      specialty: accessRequests.specialty,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
    })
    .from(appointments)
    .leftJoin(accessRequests, eq(appointments.requestId, accessRequests.id))
    .leftJoin(patients, eq(accessRequests.patientId, patients.id))
    .where(
      and(
        eq(appointments.organizationId, organizationId),
        inArray(appointments.status, ["scheduled", "rescheduled"]),
        gte(appointments.scheduledAt, new Date()),
      ),
    )
    .orderBy(appointments.scheduledAt)
    .limit(100);

  return Promise.all(
    rows.map(async (r) => ({
      ...r,
      token: await createConfirmToken({
        appointmentId: r.appointmentId,
        organizationId,
      }),
    })),
  );
}
