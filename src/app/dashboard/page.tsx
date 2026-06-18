import Link from "next/link";
import { UploadCloud } from "lucide-react";

import { getCurrentUser } from "@/lib/dal";
import { getDashboardKpis, getQueueBySpecialty } from "@/lib/queries/dashboard";
import { logout } from "@/lib/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  // verifySession() roda dentro de getCurrentUser e redireciona se não autenticado.
  const [user, kpis, bySpecialty] = await Promise.all([
    getCurrentUser(),
    getDashboardKpis(),
    getQueueBySpecialty(),
  ]);

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard geral</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Bem-vindo, {user?.name ?? "operador"}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/importar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-xl bg-black px-4 font-semibold text-white hover:bg-zinc-900",
              )}
            >
              <UploadCloud className="mr-2 size-4" aria-hidden="true" />
              Importar dados
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost">
                Sair
              </Button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi label="Em fila" value={kpis.queueTotal} />
          <Kpi label="Pacientes" value={kpis.patients} />
          <Kpi label="Agendados" value={kpis.scheduled} />
          <Kpi label="Confirmados" value={kpis.confirmed} />
          <Kpi label="Faltas" value={kpis.noShows} />
          <Kpi label="Cancelamentos" value={kpis.cancellations} />
        </section>

        <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
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
    </main>
  );
}
