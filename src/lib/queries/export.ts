import "server-only";
import { and, eq, ilike } from "drizzle-orm";

import { db } from "@/db";
import { accessRequests, appointments, patients } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type ExportFilters = {
  specialty?: string;
  status?: string;
};

export type ExportRow = {
  patientName: string | null;
  externalId: string | null;
  contact: string | null;
  specialty: string | null;
  procedure: string | null;
  priority: string | null;
  requestedAt: Date | null;
  scheduledAt: Date | null;
  professional: string | null;
  status: string | null;
};

/** Dados da fila/agenda filtrados para exportação (RF13). */
export async function getFilteredQueueRows(
  filters: ExportFilters,
): Promise<ExportRow[]> {
  const { organizationId } = await verifySession();

  const conditions = [eq(accessRequests.organizationId, organizationId)];
  if (filters.specialty) {
    conditions.push(ilike(accessRequests.specialty, `%${filters.specialty}%`));
  }
  if (filters.status) {
    conditions.push(eq(appointments.status, filters.status as never));
  }

  const rows = await db
    .select({
      patientName: patients.name,
      externalId: patients.externalId,
      contact: patients.contact,
      specialty: accessRequests.specialty,
      procedure: accessRequests.procedure,
      priority: accessRequests.priority,
      requestedAt: accessRequests.requestedAt,
      scheduledAt: appointments.scheduledAt,
      professional: appointments.professional,
      status: appointments.status,
    })
    .from(accessRequests)
    .innerJoin(patients, eq(accessRequests.patientId, patients.id))
    .leftJoin(appointments, eq(appointments.requestId, accessRequests.id))
    .where(and(...conditions))
    .limit(5000);

  return rows;
}
