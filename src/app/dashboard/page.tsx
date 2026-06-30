import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  Download,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/lib/dal";
import { getDashboardKpis, getQueueBySpecialty } from "@/lib/queries/dashboard";
import { getRecommendations } from "@/lib/queries/recomendacoes";
import type { Recommendation } from "@/lib/recomendacoes/engine";

type KpiDef = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  fg: string;
  bg: string;
};

function KpiCard({ def }: { def: KpiDef }) {
  const Icon = def.icon;
  return (
    <div className="rounded-2xl border border-[#eaeff5] bg-white p-5 shadow-[0_1px_3px_rgba(15,27,42,0.04)] transition-shadow hover:shadow-[0_6px_20px_rgba(15,27,42,0.07)]">
      <span
        className="inline-flex size-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: def.bg, color: def.fg }}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-950">
        {def.value.toLocaleString("pt-BR")}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-zinc-500">{def.label}</p>
    </div>
  );
}

const PRIORITY_DOT: Record<Recommendation["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-zinc-300",
};

export default async function DashboardPage() {
  const [user, kpis, bySpecialty, recs] = await Promise.all([
    getCurrentUser(),
    getDashboardKpis(),
    getQueueBySpecialty(),
    getRecommendations(),
  ]);

  const kpiDefs: KpiDef[] = [
    { label: "Em fila", value: kpis.queueTotal, icon: Users, fg: "#4f46e5", bg: "#ecf2ff" },
    { label: "Pacientes", value: kpis.patients, icon: UserRound, fg: "#2563eb", bg: "#e8f1ff" },
    { label: "Agendados", value: kpis.scheduled, icon: CalendarClock, fg: "#0a9f93", bg: "#e6fbf8" },
    { label: "Confirmados", value: kpis.confirmed, icon: CalendarCheck2, fg: "#108b58", bg: "#e7f7ef" },
    { label: "Faltas", value: kpis.noShows, icon: CalendarX2, fg: "#e0556a", bg: "#fdeef0" },
    { label: "Cancelamentos", value: kpis.cancellations, icon: Ban, fg: "#c2780f", bg: "#fff4e6" },
  ];

  const maxSpecialty = bySpecialty[0]?.total || 1;

  return (
    <div className="flex flex-col">
      <div className="px-8 pt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Bem-vindo, {user?.name ?? "operador"}. Aqui está o pulso da sua
          operação.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-8 pt-6">
        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpiDefs.map((def) => (
            <KpiCard key={def.label} def={def} />
          ))}
        </section>

        {/* Plano de ação + Fila por especialidade */}
        <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          {/* Plano de ação */}
          <div className="flex flex-col rounded-[20px] border border-[#eaeff5] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#e6fbf8] text-[#0a9f93]">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-[15px] font-bold text-zinc-900">
                  Plano de ação
                </h2>
              </div>
              <Link
                href="/dashboard/recomendacoes"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a9f93] hover:text-[#08877d]"
              >
                Ver tudo <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            {recs.length === 0 ? (
              <p className="mt-6 flex-1 text-sm text-zinc-500">
                Nenhuma ação crítica agora — a operação está sob controle. 🎉
              </p>
            ) : (
              <ul className="mt-4 flex flex-1 flex-col divide-y divide-zinc-100">
                {recs.slice(0, 4).map((rec) => (
                  <li key={rec.id} className="flex items-start gap-3 py-3">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${PRIORITY_DOT[rec.priority]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[13.5px] font-semibold text-zinc-900">
                          {rec.title}
                        </p>
                        <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wide text-zinc-400">
                          {rec.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-[#0a7d73]">
                        {rec.impact}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/dashboard/recomendacoes"
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1622] text-sm font-semibold text-white transition-colors hover:bg-[#16293a]"
            >
              Abrir plano de ação
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Fila por especialidade */}
          <div className="rounded-[20px] border border-[#eaeff5] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-zinc-900">
                Fila por especialidade
              </h2>
              <a
                href="/api/export/queue"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a9f93] hover:text-[#08877d]"
              >
                <Download className="size-3.5" aria-hidden="true" /> CSV
              </a>
            </div>

            {bySpecialty.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">
                Nenhum dado ainda. Comece importando uma planilha.
              </p>
            ) : (
              <ul className="mt-5 space-y-3.5">
                {bySpecialty.slice(0, 8).map((r, i) => {
                  const pct = Math.round((r.total / maxSpecialty) * 100);
                  return (
                    <li key={i}>
                      <div className="mb-1 flex items-center justify-between text-[13px]">
                        <span className="text-zinc-700">
                          {r.specialty ?? "Sem especialidade"}
                        </span>
                        <span className="tabular-nums font-semibold text-zinc-900">
                          {r.total}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#22d6c8] to-[#0a9f93]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
