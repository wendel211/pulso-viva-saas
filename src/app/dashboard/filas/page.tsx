import { Download, Filter } from "lucide-react";

import { getFilaRows, getFilaFacets } from "@/lib/queries/filas";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  rescheduled: "Reagendado",
  attended: "Compareceu",
  no_show: "Faltou",
  cancelled: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  rescheduled: "bg-amber-100 text-amber-800",
  attended: "bg-emerald-100 text-emerald-700",
  no_show: "bg-red-100 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-500",
};

const PRIORITY_COLOR: Record<string, string> = {
  urgente: "bg-red-100 text-red-700",
  alta: "bg-amber-100 text-amber-800",
};

export default async function FilasPage({
  searchParams,
}: {
  searchParams: Promise<{
    especialidade?: string;
    status?: string;
    unidade?: string;
  }>;
}) {
  const params = await searchParams;
  const filters = {
    specialty: params.especialidade || undefined,
    status: params.status || undefined,
    unitId: params.unidade || undefined,
  };

  const [rows, facets] = await Promise.all([
    getFilaRows(filters),
    getFilaFacets(),
  ]);

  const exportParams = new URLSearchParams();
  if (filters.specialty) exportParams.set("specialty", filters.specialty);
  if (filters.status) exportParams.set("status", filters.status);
  const exportHref = `/api/export/queue?${exportParams.toString()}`;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Filas</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {rows.length} registro(s) — opere e priorize a fila por
              especialidade, unidade e status.
            </p>
          </div>
          <a
            href={exportHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="size-4" aria-hidden="true" />
            Exportar filtro (CSV)
          </a>
        </div>

        {/* Filtros */}
        <form className="mt-6 flex flex-wrap items-end gap-3 rounded-[20px] border border-[#eaeff5] bg-white p-4 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
            <Filter className="size-4" aria-hidden="true" /> Filtros
          </div>
          <select
            name="especialidade"
            defaultValue={filters.specialty ?? ""}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-2 text-sm"
          >
            <option value="">Todas especialidades</option>
            {facets.specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-2 text-sm"
          >
            <option value="">Todos status</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {facets.units.length > 0 ? (
            <select
              name="unidade"
              defaultValue={filters.unitId ?? ""}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-2 text-sm"
            >
              <option value="">Todas unidades</option>
              {facets.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="submit"
            className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white"
          >
            Aplicar
          </button>
          <a
            href="/dashboard/filas"
            className="h-10 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800"
          >
            Limpar
          </a>
        </form>

        {/* Tabela */}
        {rows.length === 0 ? (
          <div className="mt-8 rounded-[20px] border border-[#eaeff5] bg-white p-8 text-center text-sm text-zinc-500 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            Nenhum registro para os filtros selecionados.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-[20px] border border-[#eaeff5] bg-white shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left">Paciente</th>
                  <th className="px-4 py-3 text-left">Especialidade</th>
                  <th className="px-4 py-3 text-left">Procedimento</th>
                  <th className="px-4 py-3 text-left">Unidade</th>
                  <th className="px-4 py-3 text-left">Espera</th>
                  <th className="px-4 py-3 text-left">Prioridade</th>
                  <th className="px-4 py-3 text-left">Agendado</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <tr key={r.requestId} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {r.patientName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {r.specialty ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {r.procedure ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {r.unitName ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700">
                      {r.waitDays != null ? `${r.waitDays}d` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.priority ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            PRIORITY_COLOR[r.priority.toLowerCase()] ??
                            "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {r.priority}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {r.scheduledAt
                        ? new Date(r.scheduledAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.status ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            STATUS_COLOR[r.status] ?? "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      ) : (
                        <span className="text-zinc-400">Em fila</span>
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
