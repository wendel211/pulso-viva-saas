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
      <header className="sticky top-0 z-10 border-b border-[#e2e8f0] bg-[#eef2f7]/85 px-8 py-6 backdrop-blur-sm">
        <h1 className="text-xl font-extrabold tracking-tight">
          Visão geral
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Bem-vindo, {user?.name ?? "operador"}.
        </p>
      </header>

      <div className="flex flex-col gap-6 p-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi label="Em fila" value={kpis.queueTotal} />
          <Kpi label="Pacientes" value={kpis.patients} />
          <Kpi label="Agendados" value={kpis.scheduled} />
          <Kpi label="Confirmados" value={kpis.confirmed} />
          <Kpi label="Faltas" value={kpis.noShows} />
          <Kpi label="Cancelamentos" value={kpis.cancellations} />
        </section>

        <section className="rounded-[20px] border border-[#eaeff5] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <h2 className="text-sm font-bold text-zinc-900">
            Fila por especialidade
          </h2>
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
                  <span className="font-semibold text-zinc-950">{r.total}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
