import { PhoneOff, Send } from "lucide-react";

import { getUpcomingConfirmations } from "@/lib/queries/confirm";
import { ConfirmLinkButton } from "@/components/confirm-link-button";

export default async function ConfirmationsPage() {
  const rows = await getUpcomingConfirmations();
  const semContato = rows.filter((r) => !r.contact).length;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6fbf8] text-[#0a9f93]">
            <Send className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Confirmação ativa</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Envie o link para o paciente confirmar ou cancelar a consulta. Quem
              cancela libera a vaga automaticamente para o encaixe.{" "}
              {rows.length} agendamento(s) futuro(s)
              {semContato > 0 ? (
                <span className="text-zinc-500"> · {semContato} sem contato</span>
              ) : null}
              .
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-[#eaeff5] bg-white p-8 text-center text-sm text-zinc-500 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            Nenhum agendamento futuro pendente de confirmação.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[20px] border border-[#eaeff5] bg-white shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Paciente</th>
                  <th className="px-4 py-3 text-left">Especialidade</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Contato</th>
                  <th className="px-4 py-3 text-right">Enviar confirmação</th>
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
                        ? new Date(r.scheduledAt).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {r.contact ?? (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <PhoneOff className="size-4" aria-hidden="true" /> sem
                          contato
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ConfirmLinkButton
                        token={r.token}
                        patientName={r.patientName}
                        contact={r.contact}
                        specialty={r.specialty}
                        scheduledAt={
                          r.scheduledAt ? r.scheduledAt.toISOString() : null
                        }
                      />
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
