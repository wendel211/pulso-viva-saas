import "server-only";
import { and, eq, isNull, or, sql, count, lt } from "drizzle-orm";

import { db } from "@/db";
import { patients, accessRequests, appointments } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type QualityIssue = {
  key: string;
  label: string;
  description: string;
  count: number;
  severity: "high" | "medium" | "low";
};

export type DataQualityReport = {
  totalPatients: number;
  totalRequests: number;
  issues: QualityIssue[];
  score: number; // 0-100, quanto maior melhor
};

const STALE_DAYS = 90;

/**
 * Avalia a qualidade da base operacional (doc §13). Não é diagnóstico clínico:
 * aponta duplicidades, campos ausentes e registros parados para evitar IA
 * sobre base ruim. Tudo filtrado por organization_id.
 */
export async function getDataQualityReport(): Promise<DataQualityReport> {
  const { organizationId } = await verifySession();

  const [
    totalPatientsRow,
    totalRequestsRow,
    missingContactRow,
    missingExternalIdRow,
    missingSpecialtyRow,
    duplicateContactRow,
    staleRequestsRow,
    orphanAppointmentsRow,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(patients)
      .where(eq(patients.organizationId, organizationId)),
    db
      .select({ value: count() })
      .from(accessRequests)
      .where(eq(accessRequests.organizationId, organizationId)),
    // Pacientes sem contato (impede confirmação ativa).
    db
      .select({ value: count() })
      .from(patients)
      .where(
        and(
          eq(patients.organizationId, organizationId),
          or(isNull(patients.contact), eq(patients.contact, "")),
        ),
      ),
    // Pacientes sem identificador externo (dificulta deduplicação/pseudonimização).
    db
      .select({ value: count() })
      .from(patients)
      .where(
        and(
          eq(patients.organizationId, organizationId),
          or(isNull(patients.externalId), eq(patients.externalId, "")),
        ),
      ),
    // Solicitações sem especialidade nem procedimento.
    db
      .select({ value: count() })
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.organizationId, organizationId),
          isNull(accessRequests.specialty),
          isNull(accessRequests.procedure),
        ),
      ),
    // Contatos duplicados (mesmo telefone em mais de um paciente).
    db
      .select({ value: count() })
      .from(
        db
          .select({ contact: patients.contact })
          .from(patients)
          .where(
            and(
              eq(patients.organizationId, organizationId),
              sql`${patients.contact} is not null and ${patients.contact} <> ''`,
            ),
          )
          .groupBy(patients.contact)
          .having(sql`count(*) > 1`)
          .as("dups"),
      ),
    // Solicitações paradas há mais de STALE_DAYS dias.
    db
      .select({ value: count() })
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.organizationId, organizationId),
          lt(
            accessRequests.requestedAt,
            sql`now() - (${STALE_DAYS} || ' days')::interval`,
          ),
        ),
      ),
    // Agendamentos sem solicitação vinculada.
    db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          isNull(appointments.requestId),
        ),
      ),
  ]);

  const totalPatients = totalPatientsRow[0]?.value ?? 0;
  const totalRequests = totalRequestsRow[0]?.value ?? 0;

  const issues: QualityIssue[] = [
    {
      key: "missing_contact",
      label: "Pacientes sem contato",
      description: "Sem telefone não é possível confirmar nem encaixar.",
      count: missingContactRow[0]?.value ?? 0,
      severity: "high",
    },
    {
      key: "duplicate_contact",
      label: "Contatos duplicados",
      description: "Mesmo telefone em mais de um cadastro — possível duplicidade.",
      count: duplicateContactRow[0]?.value ?? 0,
      severity: "medium",
    },
    {
      key: "missing_external_id",
      label: "Sem identificador externo",
      description: "Dificulta deduplicação e pseudonimização (LGPD).",
      count: missingExternalIdRow[0]?.value ?? 0,
      severity: "low",
    },
    {
      key: "missing_specialty",
      label: "Solicitações sem especialidade/procedimento",
      description: "Impede priorização e previsão de gargalo por fila.",
      count: missingSpecialtyRow[0]?.value ?? 0,
      severity: "high",
    },
    {
      key: "stale_requests",
      label: `Solicitações paradas (> ${STALE_DAYS} dias)`,
      description: "Registros antigos podem distorcer a fila e os scores.",
      count: staleRequestsRow[0]?.value ?? 0,
      severity: "medium",
    },
    {
      key: "orphan_appointments",
      label: "Agendamentos sem solicitação",
      description: "Agenda sem origem na fila — verifique a importação.",
      count: orphanAppointmentsRow[0]?.value ?? 0,
      severity: "low",
    },
  ];

  // Score: 100 menos penalidade ponderada pela proporção de registros afetados.
  const base = Math.max(totalPatients + totalRequests, 1);
  const weight = { high: 1, medium: 0.5, low: 0.25 } as const;
  const penalty = issues.reduce(
    (acc, i) => acc + (i.count / base) * weight[i.severity] * 100,
    0,
  );
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  return { totalPatients, totalRequests, issues, score };
}
