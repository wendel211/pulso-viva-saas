import "server-only";
import { and, eq, desc, sql } from "drizzle-orm";

import { db } from "@/db";
import { accessRequests, appointments, patients, units } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type FilaFilters = {
  specialty?: string;
  status?: string;
  unitId?: string;
};

export type FilaRow = {
  requestId: string;
  patientName: string | null;
  specialty: string | null;
  procedure: string | null;
  priority: string | null;
  unitName: string | null;
  requestedAt: Date | null;
  scheduledAt: Date | null;
  status: string | null;
  waitDays: number | null;
};

export type FilaFacets = {
  specialties: string[];
  units: { id: string; name: string }[];
};

const STATUS_VALUES = [
  "scheduled",
  "confirmed",
  "rescheduled",
  "attended",
  "no_show",
  "cancelled",
] as const;

/** Lista a fila/agenda filtrável por especialidade, status e unidade (RF06/RF07). */
export async function getFilaRows(filters: FilaFilters): Promise<FilaRow[]> {
  const { organizationId } = await verifySession();

  const conditions = [eq(accessRequests.organizationId, organizationId)];
  if (filters.specialty) {
    conditions.push(eq(accessRequests.specialty, filters.specialty));
  }
  if (filters.unitId) {
    conditions.push(eq(appointments.unitId, filters.unitId));
  }
  if (filters.status && STATUS_VALUES.includes(filters.status as never)) {
    conditions.push(eq(appointments.status, filters.status as never));
  }

  const rows = await db
    .select({
      requestId: accessRequests.id,
      patientName: patients.name,
      specialty: accessRequests.specialty,
      procedure: accessRequests.procedure,
      priority: accessRequests.priority,
      unitName: units.name,
      requestedAt: accessRequests.requestedAt,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
    })
    .from(accessRequests)
    .innerJoin(patients, eq(accessRequests.patientId, patients.id))
    .leftJoin(appointments, eq(appointments.requestId, accessRequests.id))
    .leftJoin(units, eq(appointments.unitId, units.id))
    .where(and(...conditions))
    .orderBy(desc(accessRequests.requestedAt))
    .limit(500);

  const now = Date.now();
  return rows.map((r) => ({
    ...r,
    waitDays: r.requestedAt
      ? Math.round((now - r.requestedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

/** Valores distintos para os filtros (especialidades e unidades). */
export async function getFilaFacets(): Promise<FilaFacets> {
  const { organizationId } = await verifySession();

  const [specialtyRows, unitRows] = await Promise.all([
    db
      .selectDistinct({ specialty: accessRequests.specialty })
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.organizationId, organizationId),
          sql`${accessRequests.specialty} is not null and ${accessRequests.specialty} <> ''`,
        ),
      ),
    db
      .select({ id: units.id, name: units.name })
      .from(units)
      .where(eq(units.organizationId, organizationId)),
  ]);

  return {
    specialties: specialtyRows
      .map((r) => r.specialty)
      .filter((s): s is string => Boolean(s))
      .sort(),
    units: unitRows,
  };
}
