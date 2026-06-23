import { eq } from "drizzle-orm";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import { getDashboardKpis } from "@/lib/queries/dashboard";
import { getSustainableImpact } from "@/lib/queries/impact";
import { getBottleneckForecast } from "@/lib/queries/bottleneck";
import { getRiskList } from "@/lib/queries/risk";
import { PrintButton } from "@/components/print-button";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-zinc-950">{value}</p>
    </div>
  );
}

export default async function ExecutiveReportPage() {
  const session = await verifySession();

  const [org, kpis, impact, bottlenecks, riskRows] = await Promise.all([
    db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, session.organizationId))
      .limit(1),
    getDashboardKpis(),
    getSustainableImpact(),
    getBottleneckForecast(),
    getRiskList(),
  ]);

  const orgName = org[0]?.name ?? "Organização";
  const criticalBottlenecks = bottlenecks
    .filter((b) => b.criticality !== "low")
    .slice(0, 5);
  const highRiskCount = riskRows.filter((r) => r.band === "high").length;
  const mediumRiskCount = riskRows.filter((r) => r.band === "medium").length;
  const generatedAt = new Date().toLocaleString("pt-BR");

  return (
    <div className="p-8 print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Relatório executivo</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Resumo de impacto e operação para apresentação e prestação de
              contas (RF11).
            </p>
          </div>
          <PrintButton />
        </div>

        <article className="rounded-[20px] border border-zinc-200 bg-white p-10 print:border-0 print:p-0 print:shadow-none">
          <header className="flex items-center justify-between border-b border-zinc-200 pb-6">
            <div>
              <p className="text-lg font-extrabold tracking-tight">
                Pulso<span className="text-[#0a9f93]">Viva</span>
              </p>
              <p className="text-xs text-zinc-500">
                Inteligência de acesso em saúde
              </p>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p className="font-semibold text-zinc-800">{orgName}</p>
              <p>Gerado em {generatedAt}</p>
            </div>
          </header>

          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">
              Visão geral da operação
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <ReportCard label="Em fila" value={String(kpis.queueTotal)} />
              <ReportCard label="Pacientes" value={String(kpis.patients)} />
              <ReportCard label="Agendados" value={String(kpis.scheduled)} />
              <ReportCard label="Confirmados" value={String(kpis.confirmed)} />
              <ReportCard label="Faltas" value={String(kpis.noShows)} />
              <ReportCard
                label="Cancelamentos"
                value={String(kpis.cancellations)}
              />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">
              Impacto sustentável
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ReportCard
                label="Vagas recuperadas"
                value={String(impact.recoveredSlots)}
              />
              <ReportCard
                label="Faltas evitadas"
                value={String(impact.avoidedNoShows)}
              />
              <ReportCard
                label="Capacidade aproveitada"
                value={`${impact.capacityUsedPercent}%`}
              />
              <ReportCard
                label="Custo preservado (estimado)"
                value={formatBRL(impact.preservedCostCents)}
              />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">
              Risco de falta
            </h2>
            <p className="mt-3 text-sm text-zinc-700">
              <span className="font-bold text-red-600">{highRiskCount}</span>{" "}
              agendamento(s) com risco alto e{" "}
              <span className="font-bold text-amber-600">
                {mediumRiskCount}
              </span>{" "}
              com risco médio de falta, de um total de {riskRows.length}{" "}
              avaliado(s).
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">
              Gargalos em atenção
            </h2>
            {criticalBottlenecks.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Nenhuma especialidade em estado crítico ou de atenção no
                momento.
              </p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs uppercase text-zinc-500">
                    <th className="py-2">Especialidade</th>
                    <th className="py-2 text-right">Fila atual</th>
                    <th className="py-2 text-right">Projeção 90d</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalBottlenecks.map((b) => (
                    <tr key={b.specialty} className="border-b border-zinc-100">
                      <td className="py-2 font-medium">{b.specialty}</td>
                      <td className="py-2 text-right">{b.queueTotal}</td>
                      <td className="py-2 text-right font-semibold">
                        {b.projection90}
                      </td>
                      <td className="py-2 text-right capitalize">
                        {b.criticality === "high" ? "Crítico" : "Atenção"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <footer className="mt-10 border-t border-zinc-200 pt-4 text-center text-[11px] text-zinc-400">
            Relatório gerado automaticamente pela PulsoViva Acesso. A IA apoia
            a decisão operacional e não substitui avaliação humana.
          </footer>
        </article>
      </div>
    </div>
  );
}
