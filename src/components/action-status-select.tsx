"use client";

import { useActionState } from "react";

import { updateActionTaskStatus } from "@/lib/actions/action-tasks";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "contacted", label: "Contatado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "rescheduled", label: "Reagendado" },
  { value: "fitted", label: "Encaixado" },
  { value: "refused", label: "Recusou" },
  { value: "not_found", label: "Não localizado" },
];

export function ActionStatusSelect({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const [state, action, pending] = useActionState(
    updateActionTaskStatus,
    undefined,
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="taskId" value={taskId} />
      <select
        name="status"
        defaultValue={currentStatus}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-9 rounded-lg border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-800 disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {state?.message ? (
        <span
          className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-600"}`}
        >
          {state.ok ? "✓" : state.message}
        </span>
      ) : null}
    </form>
  );
}
