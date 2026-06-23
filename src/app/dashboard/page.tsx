import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  Download,
  Gauge,
  HeartPulse,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

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
              href="/dashboard/impacto"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl px-4 font-semibold",
              )}
            >
              <HeartPulse className="mr-2 size-4" aria-hidden="true" />
              Impacto
            </Link>
            <Link
              href="/dashboard/gargalos"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl px-4 font-semibold",
              )}
            >
              <Gauge className="mr-2 size-4" aria-hidden="true" />
              Gargalos
            </Link>
            <Link
              href="/dashboard/encaixe"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl px-4 font-semibold",
              )}
            >
              <CalendarCheck className="mr-2 size-4" aria-hidden="true" />
              Encaixe inteligente
            </Link>
            <Link
              href="/dashboard/risco"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl px-4 font-semibold",
              )}
            >
              <Activity className="mr-2 size-4" aria-hidden="true" />
              Risco de falta
            </Link>
            <Link
              href="/dashboard/qualidade"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl px-4 font-semibold",
              )}
            >
              <ShieldCheck className="mr-2 size-4" aria-hidden="true" />
              Qualidade dos dados
            </Link>
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
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
    </main>
  );
}
