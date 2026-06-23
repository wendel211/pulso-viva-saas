import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { getBottleneckForecast } from "@/lib/queries/bottleneck";
import type { CriticalityLevel } from "@/lib/queries/bottleneck";

const CRITICALITY_STYLES: Record<CriticalityLevel, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-emerald-100 text-emerald-700",
};

const CRITICALITY_LABEL: Record<CriticalityLevel, string> = {
  high: "Crítico",
  medium: "Atenção",
  low: "Estável",
};

function TrendIcon({ net }: { net: number }) {
  if (net > 0)
    return <TrendingUp className="size-4 text-red-500" aria-hidden="true" />;
  if (net < 0)
    return (
      <TrendingDown className="size-4 text-emerald-500" aria-hidden="true" />
    );
  return <Minus className="size-4 text-zinc-400" aria-hidden="true" />;
}

export default async function BottleneckPage() {
  const rows = await getBottleneckForecast();
  const critical = rows.filter((r) => r.criticality === "high").length;

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Voltar ao dashboard
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold">Previsão de gargalo</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Projeção linear baseada na taxa líquida dos últimos 30 dias
            (entradas − atendimentos concluídos).
            {critical > 0 ? (
              <span className="ml-1 font-medium text-red-600">
                {critical} especialidade(s) em estado crítico.
              </span>
            ) : null}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
            Sem dados suficientes ainda. Importe planilhas de fila e agenda.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Especialidade</th>
                  <th className="px-4 py-3 text-left">Fila atual</th>
                  <th className="px-4 py-3 text-left">Entradas (30d)</th>
                  <th className="px-4 py-3 text-left">Atendidos (30d)</th>
                  <th className="px-4 py-3 text-left">Tendência</th>
                  <th className="px-4 py-3 text-left">Projeção 30d</th>
                  <th className="px-4 py-3 text-left">Projeção 60d</th>
                  <th className="px-4 py-3 text-left">Projeção 90d</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <tr key={r.specialty} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {r.specialty}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.queueTotal}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.inflow30d}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.outflow30d}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <TrendIcon net={r.netRatePerMonth} />
                        <span className="tabular-nums text-xs text-zinc-600">
                          {r.netRatePerMonth > 0 ? "+" : ""}
                          {r.netRatePerMonth}/mês
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.projection30}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.projection60}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-zinc-900">
                      {r.projection90}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${CRITICALITY_STYLES[r.criticality]}`}
                      >
                        {CRITICALITY_LABEL[r.criticality]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
