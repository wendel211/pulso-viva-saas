import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { getFilteredQueueRows } from "@/lib/queries/export";
import { toCsv } from "@/lib/export/csv";

/**
 * Exportação de fila/agenda filtrada em CSV (RF13).
 * Protegido pela mesma verificação de sessão usada no resto do app.
 */
export async function GET(req: NextRequest) {
  const session = await verifySession();

  const specialty = req.nextUrl.searchParams.get("specialty") ?? undefined;
  const status = req.nextUrl.searchParams.get("status") ?? undefined;

  const rows = await getFilteredQueueRows({ specialty, status });

  const csv = toCsv(
    [
      "Paciente",
      "ID externo",
      "Contato",
      "Especialidade",
      "Procedimento",
      "Prioridade",
      "Data da solicitação",
      "Data do agendamento",
      "Profissional",
      "Status",
    ],
    rows.map((r) => [
      r.patientName,
      r.externalId,
      r.contact,
      r.specialty,
      r.procedure,
      r.priority,
      r.requestedAt ? r.requestedAt.toISOString() : null,
      r.scheduledAt ? r.scheduledAt.toISOString() : null,
      r.professional,
      r.status,
    ]),
  );

  await db.insert(auditLogs).values({
    organizationId: session.organizationId,
    userId: session.userId,
    action: "export",
    resource: "queue_csv",
    metadata: { specialty, status, rowCount: rows.length },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pulsoviva-fila-${Date.now()}.csv"`,
    },
  });
}
