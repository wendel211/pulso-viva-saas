import { HeartHandshake, Phone, PhoneOff } from "lucide-react";

import { getAbandonmentList } from "@/lib/queries/abandono";
import type { AbandonmentFactor } from "@/lib/abandono/engine";
import { ReactivationButton } from "@/components/reactivation-button";

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
    score >= 60 ? "bg-red-500" : score >= 35 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="tabular-nums text-xs font-semibold text-zinc-900">{score}</span>
    </div>
  );
}

function Reasons({ factors }: { factors: AbandonmentFactor[] }) {
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

export default async function ReactivationPage() {
  const rows = await getAbandonmentList();
  const high = rows.filter((r) => r.band === "high").length;
  const unreachable = rows.filter((r) => !r.reachable).length;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6fbf8] text-[#0a9f93]">
            <HeartHandshake className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Reativação e busca ativa</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Pacientes em risco de abandonar o cuidado. Na clínica, é recall de
              quem parou o tratamento; no SUS, é a lista de busca ativa para o
              agente comunitário. {rows.length} paciente(s) —{" "}
              <span className="font-medium text-red-600">{high} risco alto</span>
              {unreachable > 0 ? (
                <span className="text-zinc-500"> · {unreachable} sem contato</span>
              ) : null}
              .
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-[#eaeff5] bg-white p-8 text-center text-sm text-zinc-500 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            Nenhum paciente em risco de abandono no momento. Importe dados ou
            rode o seed de demonstração para ver a lista.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[20px] border border-[#eaeff5] bg-white shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Paciente</th>
                  <th className="px-4 py-3 text-left">Especialidade</th>
                  <th className="px-4 py-3 text-left">Inatividade</th>
                  <th className="px-4 py-3 text-left">Contato</th>
                  <th className="px-4 py-3 text-left">Risco</th>
                  <th className="px-4 py-3 text-left">Score</th>
                  <th className="px-4 py-3 text-left">Motivos</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.slice(0, 50).map((r) => (
                  <tr key={r.patientId} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {r.patientName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{r.specialty ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.daysSinceLastActivity != null
                        ? `${r.daysSinceLastActivity}d`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.reachable ? (
                        <Phone className="size-4 text-emerald-500" aria-label="Tem contato" />
                      ) : (
                        <PhoneOff className="size-4 text-red-400" aria-label="Sem contato" />
                      )}
                    </td>
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
                      <Reasons factors={r.factors} />
                    </td>
                    <td className="px-4 py-3">
                      {r.reachable ? (
                        <ReactivationButton
                          patientId={r.patientId}
                          patientName={r.patientName}
                        />
                      ) : (
                        <span className="text-xs text-zinc-400">
                          atualizar cadastro
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
