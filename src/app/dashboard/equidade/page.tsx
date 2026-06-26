import { Scale, AlertTriangle } from "lucide-react";

import { getEquityReport } from "@/lib/queries/equidade";
import type { DimensionBreakdown } from "@/lib/equidade/engine";

function indexColor(v: number) {
  if (v >= 80) return "text-emerald-600";
  if (v >= 60) return "text-amber-600";
  return "text-red-600";
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function DimensionCard({ dim }: { dim: DimensionBreakdown }) {
  const maxWait = dim.groups[0]?.avgWaitDays || 1;
  const ratio = dim.disparityRatio;

  return (
    <div className="rounded-[20px] border border-[#eaeff5] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900">{dim.label}</h3>
        {ratio >= 1.5 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
            <AlertTriangle className="size-3" aria-hidden="true" />
            {fmt(ratio)}× de disparidade
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            equilibrado
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2.5">
        {dim.groups.map((g, i) => {
          const pct = Math.round((g.avgWaitDays / maxWait) * 100);
          const penalized = i === 0 && dim.groups.length > 1 && ratio >= 1.5;
          return (
            <li key={g.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className={penalized ? "font-semibold text-red-700" : "text-zinc-700"}>
                  {g.label}
                  <span className="ml-1 text-zinc-400">({g.count})</span>
                </span>
                <span className="tabular-nums font-semibold text-zinc-900">
                  {fmt(g.avgWaitDays)} dias
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full ${penalized ? "bg-red-500" : "bg-[#22d6c8]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {dim.mostPenalized && ratio >= 1.5 ? (
        <p className="mt-4 text-xs text-zinc-500">
          Grupo mais penalizado: <span className="font-medium text-zinc-700">{dim.mostPenalized}</span>.
          Priorizar este grupo aproxima a fila da equidade.
        </p>
      ) : null}
    </div>
  );
}

export default async function EquityPage() {
  const report = await getEquityReport();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6fbf8] text-[#0a9f93]">
            <Scale className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Índice de Equidade de Acesso</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Mede se o tempo de espera é justo entre grupos. Equidade é
              princípio do SUS — aqui ela vira número auditável.
            </p>
          </div>
        </div>

        {report.totalRecords === 0 ? (
          <div className="mt-10 rounded-[20px] border border-[#eaeff5] bg-white p-8 text-center text-sm text-zinc-500 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            Sem dados suficientes. Importe planilhas ou rode o seed de
            demonstração.
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[#eaeff5] bg-white p-6 text-center shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Índice de equidade
                </p>
                <p className={`mt-2 text-5xl font-bold ${indexColor(report.equityIndex)}`}>
                  {report.equityIndex}
                </p>
                <p className="mt-1 text-xs text-zinc-400">0 = desigual · 100 = equitativo</p>
              </div>
              <div className="rounded-[20px] border border-[#eaeff5] bg-white p-6 text-center shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Espera média geral
                </p>
                <p className="mt-2 text-5xl font-bold text-zinc-900">
                  {fmt(report.overallAvgWaitDays)}
                </p>
                <p className="mt-1 text-xs text-zinc-400">dias</p>
              </div>
              <div className="rounded-[20px] border border-[#eaeff5] bg-white p-6 text-center shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Solicitações analisadas
                </p>
                <p className="mt-2 text-5xl font-bold text-zinc-900">
                  {report.totalRecords}
                </p>
                <p className="mt-1 text-xs text-zinc-400">na base atual</p>
              </div>
            </div>

            {report.dimensions.length === 0 ? (
              <p className="mt-8 text-sm text-zinc-500">
                Não há grupos comparáveis o suficiente para medir disparidade.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {report.dimensions.map((dim) => (
                  <DimensionCard key={dim.key} dim={dim} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
