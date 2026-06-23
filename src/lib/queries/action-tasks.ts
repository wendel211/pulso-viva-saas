import "server-only";
import { and, eq, ne, desc } from "drizzle-orm";

import { db } from "@/db";
import { actionTasks, patients } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type ActionTaskRow = {
  id: string;
  type: string;
  status: string;
  recommendation: string | null;
  patientName: string | null;
  patientContact: string | null;
  createdAt: Date;
};

/**
 * Lista de ações operacionais pendentes (RF10): confirmação, encaixe ou
 * atualização cadastral. Operador atualiza o status manualmente.
 */
export async function getActionTasks(): Promise<ActionTaskRow[]> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({
      id: actionTasks.id,
      type: actionTasks.type,
      status: actionTasks.status,
      recommendation: actionTasks.recommendation,
      patientName: patients.name,
      patientContact: patients.contact,
      createdAt: actionTasks.createdAt,
    })
    .from(actionTasks)
    .leftJoin(patients, eq(actionTasks.patientId, patients.id))
    .where(
      and(
        eq(actionTasks.organizationId, organizationId),
        // Esconde tarefas já fechadas com sucesso (encaixado) ou recusadas há muito tempo
        // mantendo o foco operacional no que ainda precisa de ação.
        ne(actionTasks.status, "fitted"),
      ),
    )
    .orderBy(desc(actionTasks.createdAt))
    .limit(200);

  return rows;
}
