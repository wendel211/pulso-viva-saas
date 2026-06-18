import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getRiskList } from "@/lib/queries/risk";
import { RiskRecalculateButton } from "@/components/risk-recalculate-button";
import type { RiskFactor } from "@/lib/risk/baseline";

const BAND_STYLES = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-emerald-100 text-emerald-700",
} as const;

const BAND_LABEL = {
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
} as const;

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 65
      ? "bg-red-500"
      : score >= 35
        ? "bg-amber-400"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="tabular-nums text-sm font-semibold text-zinc-900">
        {score}
      </span>
    </div>
  );
}

function FactorList({ factors }: { factors: RiskFactor[] }) {
  const active = factors.filter((f) => f.value > 0);
  if (active.length === 0) return <span className="text-zinc-400">—</span>;
  return (
    <ul className="space-y-0.5 text-xs text-zinc-600">
      {active.map((f) => (
        <li key={f.name}>
          <span className="font-medium">{f.name}:</span> {f.reason}
        </li>
      ))}
    </ul>
  );
}

export default async function RiskPage() {
  const rows = await getRiskList();

  const high = rows.filter((r) => r.band === "high").length;
  const medium = rows.filter((r) => r.band === "medium").length;

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Voltar ao dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Risco de falta</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {rows.length} agendamento(s) avaliado(s) —{" "}
              <span className="font-medium text-red-600">{high} alto</span>,{" "}
              <span className="font-medium text-amber-600">{medium} médio</span>.
            </p>
          </div>
          <RiskRecalculateButton />
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
            Nenhum score calculado. Importe dados e clique em
            &ldquo;Recalcular scores&rdquo;.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Paciente</th>
                  <th className="px-4 py-3 text-left">Especialidade</th>
                  <th className="px-4 py-3 text-left">Agendado para</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Risco</th>
                  <th className="px-4 py-3 text-left">Score</th>
                  <th className="px-4 py-3 text-left">Fatores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <tr key={r.appointmentId} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {r.patientName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {r.specialty ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {r.scheduledAt
                        ? new Date(r.scheduledAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{r.status}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${BAND_STYLES[r.band]}`}
                      >
                        {BAND_LABEL[r.band]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={r.score} />
                    </td>
                    <td className="px-4 py-3">
                      <FactorList factors={r.factors} />
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
