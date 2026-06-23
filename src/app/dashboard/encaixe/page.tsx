import Link from "next/link";
import { CalendarOff, Phone, PhoneOff, Trophy } from "lucide-react";

import { getOpenSlots, getRankedCandidates } from "@/lib/queries/ranking";
import { FitPatientButton } from "@/components/fit-patient-button";

const PRIORITY_LABEL: Record<number, string> = {
  3: "Urgente",
  2: "Alta",
  1: "Normal",
  0: "Baixa",
};

const PRIORITY_COLOR: Record<number, string> = {
  3: "bg-red-100 text-red-700",
  2: "bg-amber-100 text-amber-800",
  1: "bg-zinc-100 text-zinc-700",
  0: "bg-zinc-50 text-zinc-500",
};

function RankBadge({ rank, score }: { rank: number; score: number }) {
  const top = rank === 0;
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        top
          ? "bg-[#22d6c8] text-[#071220]"
          : "bg-zinc-100 text-zinc-500"
      }`}
      title={`Score de encaixe: ${score}`}
    >
      {top ? <Trophy className="size-4" aria-hidden="true" /> : rank + 1}
    </div>
  );
}

export default async function EncaixePage({
  searchParams,
}: {
  searchParams: Promise<{ vaga?: string; especialidade?: string }>;
}) {
  const params = await searchParams;
  const selectedSlot = params.vaga ?? null;
  const specialty = params.especialidade ?? null;

  const [slots, candidates] = await Promise.all([
    getOpenSlots(),
    selectedSlot ? getRankedCandidates(specialty) : Promise.resolve([]),
  ]);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-2xl font-semibold">Encaixe inteligente</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Selecione uma vaga ociosa para ver os candidatos recomendados pela IA.
          </p>
        </div>

        {/* Vagas abertas */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Vagas abertas ({slots.length})
          </h2>

          {slots.length === 0 ? (
            <div className="rounded-2xl border border-black/5 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
              Nenhuma vaga aberta no momento.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.appointmentId;
                return (
                  <Link
                    key={slot.appointmentId}
                    href={`/dashboard/encaixe?vaga=${slot.appointmentId}&especialidade=${slot.specialty ?? ""}`}
                    className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
                      isSelected
                        ? "border-[#22d6c8] bg-[#071220] text-white"
                        : "border-black/5 bg-white text-zinc-950 shadow-sm hover:border-[#22d6c8]/40"
                    }`}
                  >
                    <CalendarOff
                      className={`mt-0.5 size-5 shrink-0 ${isSelected ? "text-[#22d6c8]" : "text-zinc-400"}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium">
                        {slot.specialty ?? "Sem especialidade"}
                      </p>
                      <p
                        className={`text-xs ${isSelected ? "text-slate-300" : "text-zinc-500"}`}
                      >
                        {slot.scheduledAt
                          ? new Date(slot.scheduledAt).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "Horário a definir"}
                      </p>
                      {slot.professional ? (
                        <p
                          className={`text-xs ${isSelected ? "text-slate-400" : "text-zinc-400"}`}
                        >
                          {slot.professional}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Ranking de candidatos */}
        {selectedSlot && (
          <section className="mt-10">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Candidatos recomendados
            </h2>
            <p className="mb-4 text-xs text-zinc-400">
              Ordenados por: tempo de espera (35%) · prioridade (30%) ·
              confiabilidade (25%) · contato (10%)
            </p>

            {candidates.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm">
                Nenhum candidato encontrado para esta especialidade.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="w-10 px-4 py-3 text-center">#</th>
                      <th className="px-4 py-3 text-left">Paciente</th>
                      <th className="px-4 py-3 text-left">Especialidade</th>
                      <th className="px-4 py-3 text-left">Espera</th>
                      <th className="px-4 py-3 text-left">Prioridade</th>
                      <th className="px-4 py-3 text-left">Contato</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Razões</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {candidates.slice(0, 20).map((c, i) => (
                      <tr
                        key={c.requestId}
                        className={i === 0 ? "bg-[#071220]/[0.03]" : "hover:bg-zinc-50"}
                      >
                        <td className="px-4 py-3 text-center">
                          <RankBadge rank={i} score={c.rankScore} />
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          {c.patientName ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {c.specialty ?? "—"}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-zinc-700">
                          {c.waitDays > 0 ? `${c.waitDays}d` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_COLOR[c.priorityLevel]}`}
                          >
                            {PRIORITY_LABEL[c.priorityLevel]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.hasContact ? (
                            <Phone
                              className="size-4 text-emerald-500"
                              aria-label="Contato disponível"
                            />
                          ) : (
                            <PhoneOff
                              className="size-4 text-red-400"
                              aria-label="Sem contato"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200">
                              <div
                                className="h-full rounded-full bg-[#22d6c8]"
                                style={{ width: `${c.rankScore}%` }}
                              />
                            </div>
                            <span className="tabular-nums text-xs font-semibold text-zinc-900">
                              {c.rankScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ul className="space-y-0.5 text-xs text-zinc-500">
                            {c.reasons.map((r) => (
                              <li key={r}>{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3">
                          <FitPatientButton
                            appointmentId={selectedSlot}
                            candidate={c}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
