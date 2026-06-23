import { ShieldAlert } from "lucide-react";

import { getAuditLog, canViewAuditLog } from "@/lib/queries/audit-log";

const ACTION_LABEL: Record<string, string> = {
  login: "Login",
  import: "Importação de dados",
  fit_patient: "Encaixe registrado",
  update_action_status: "Atualização de status",
};

export default async function AuditLogPage() {
  const [allowed, logs] = await Promise.all([
    canViewAuditLog(),
    getAuditLog(),
  ]);

  if (!allowed) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl rounded-[20px] border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-800">
          <ShieldAlert className="mx-auto mb-2 size-6" aria-hidden="true" />
          Apenas gestores, administradores e DPO/Auditor podem visualizar a
          trilha de auditoria.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Trilha de auditoria</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Registro de eventos sensíveis: login, importação, exportação e
          alteração de status (RF16, LGPD).
        </p>

        {logs.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-[#eaeff5] bg-white p-8 text-center text-sm text-zinc-500 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            Nenhum evento registrado ainda.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[20px] border border-[#eaeff5] bg-white shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Data/hora</th>
                  <th className="px-4 py-3 text-left">Usuário</th>
                  <th className="px-4 py-3 text-left">Ação</th>
                  <th className="px-4 py-3 text-left">Recurso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 tabular-nums text-zinc-600">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {log.userName ?? "Sistema"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {ACTION_LABEL[log.action] ?? log.action}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {log.resource ?? "—"}
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
