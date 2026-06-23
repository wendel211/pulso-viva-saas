import { getActionTasks } from "@/lib/queries/action-tasks";
import { ActionStatusSelect } from "@/components/action-status-select";

const TYPE_LABEL: Record<string, string> = {
  encaixe: "Encaixe",
  confirmacao: "Confirmação",
  atualizacao_cadastral: "Atualização cadastral",
};

export default async function ActionTasksPage() {
  const tasks = await getActionTasks();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Lista de ações</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Atualize manualmente o andamento de contatos, confirmações e
          encaixes (RF10).
        </p>

        {tasks.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-[#eaeff5] bg-white p-8 text-center text-sm text-zinc-500 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            Nenhuma ação pendente. Tarefas aparecem aqui após um encaixe ser
            sugerido ou registrado.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[20px] border border-[#eaeff5] bg-white shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Paciente</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Recomendação</th>
                  <th className="px-4 py-3 text-left">Contato</th>
                  <th className="px-4 py-3 text-left">Criado em</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {task.patientName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {TYPE_LABEL[task.type] ?? task.type}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {task.recommendation ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {task.patientContact ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <ActionStatusSelect
                        taskId={task.id}
                        currentStatus={task.status}
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
