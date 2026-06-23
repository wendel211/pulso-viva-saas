import { Download } from "lucide-react";

import { getCurrentUser } from "@/lib/dal";
import { getDashboardKpis, getQueueBySpecialty } from "@/lib/queries/dashboard";

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[#eaeff5] bg-white p-5 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [user, kpis, bySpecialty] = await Promise.all([
    getCurrentUser(),
    getDashboardKpis(),
    getQueueBySpecialty(),
  ]);

  return (
    <div className="flex flex-col">
      <div className="px-8 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Bem-vindo, {user?.name ?? "operador"}.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-8 pt-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi label="Em fila" value={kpis.queueTotal} />
          <Kpi label="Pacientes" value={kpis.patients} />
          <Kpi label="Agendados" value={kpis.scheduled} />
          <Kpi label="Confirmados" value={kpis.confirmed} />
          <Kpi label="Faltas" value={kpis.noShows} />
          <Kpi label="Cancelamentos" value={kpis.cancellations} />
        </section>

        <section className="rounded-[20px] border border-[#eaeff5] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">
              Fila por especialidade
            </h2>
            <a
              href="/api/export/queue"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a9f93] hover:text-[#08978d]"
            >
              <Download className="size-3.5" aria-hidden="true" />
              Exportar tudo (CSV)
            </a>
          </div>
          {bySpecialty.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              Nenhum dado ainda. Comece importando uma planilha.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {bySpecialty.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-zinc-700">
                    {r.specialty ?? "Sem especialidade"}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold text-zinc-950">
                      {r.total}
                    </span>
                    {r.specialty ? (
                      <a
                        href={`/api/export/queue?specialty=${encodeURIComponent(r.specialty)}`}
                        className="text-zinc-400 hover:text-[#0a9f93]"
                        title="Exportar esta especialidade"
                      >
                        <Download className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
