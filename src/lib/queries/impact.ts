import "server-only";
import { and, eq, count } from "drizzle-orm";

import { db } from "@/db";
import { actionTasks, appointments } from "@/db/schema";
import { verifySession } from "@/lib/dal";

/**
 * Valor médio estimado por vaga, usado para calcular custo preservado
 * (doc §16). MVP usa um valor fixo; evolui para configurável por
 * organização/procedimento (RF17).
 */
const AVG_SLOT_VALUE_CENTS = 15000; // R$ 150,00

export type SustainableImpact = {
  recoveredSlots: number;
  avoidedNoShows: number;
  capacityUsedPercent: number;
  preservedCostCents: number;
};

/** Painel de impacto sustentável (RF15) — métricas acionáveis e vendáveis. */
export async function getSustainableImpact(): Promise<SustainableImpact> {
  const { organizationId } = await verifySession();

  const [recoveredRow, confirmedRow, rescheduledRow, attendedRow, totalRow] =
    await Promise.all([
      // Vagas recuperadas: encaixes registrados via ranking inteligente.
      db
        .select({ value: count() })
        .from(actionTasks)
        .where(
          and(
            eq(actionTasks.organizationId, organizationId),
            eq(actionTasks.type, "encaixe"),
          ),
        ),
      // Faltas evitadas: agendamentos confirmados ou reagendados antes do no-show.
      db
        .select({ value: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.organizationId, organizationId),
            eq(appointments.status, "confirmed"),
          ),
        ),
      db
        .select({ value: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.organizationId, organizationId),
            eq(appointments.status, "rescheduled"),
          ),
        ),
      db
        .select({ value: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.organizationId, organizationId),
            eq(appointments.status, "attended"),
          ),
        ),
      db
        .select({ value: count() })
        .from(appointments)
        .where(eq(appointments.organizationId, organizationId)),
    ]);

  const recoveredSlots = recoveredRow[0]?.value ?? 0;
  const avoidedNoShows =
    (confirmedRow[0]?.value ?? 0) + (rescheduledRow[0]?.value ?? 0);
  const attended = attendedRow[0]?.value ?? 0;
  const total = totalRow[0]?.value ?? 0;

  const capacityUsedPercent =
    total > 0 ? Math.round((attended / total) * 100) : 0;

  const preservedCostCents =
    (recoveredSlots + avoidedNoShows) * AVG_SLOT_VALUE_CENTS;

  return {
    recoveredSlots,
    avoidedNoShows,
    capacityUsedPercent,
    preservedCostCents,
  };
}
