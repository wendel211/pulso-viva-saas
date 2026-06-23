"use client";

import { useActionState } from "react";

import { updateUserRole, toggleUserStatus } from "@/lib/actions/team";
import type { TeamMember } from "@/lib/queries/team";

const ROLE_OPTIONS = [
  { value: "operator", label: "Operador de acesso" },
  { value: "analyst", label: "Analista/coordenação" },
  { value: "org_manager", label: "Gestor da organização" },
  { value: "dpo_auditor", label: "DPO/Auditor" },
];

export function TeamMemberRow({
  member,
  isSelf,
}: {
  member: TeamMember;
  isSelf: boolean;
}) {
  const [roleState, roleAction, rolePending] = useActionState(
    updateUserRole,
    undefined,
  );
  const [statusState, statusAction, statusPending] = useActionState(
    toggleUserStatus,
    undefined,
  );

  const nextStatus = member.status === "active" ? "inactive" : "active";

  return (
    <tr className="hover:bg-zinc-50">
      <td className="px-4 py-3">
        <p className="font-medium text-zinc-900">{member.name}</p>
        <p className="text-xs text-zinc-500">{member.email}</p>
      </td>
      <td className="px-4 py-3">
        <form action={roleAction}>
          <input type="hidden" name="userId" value={member.id} />
          <select
            name="role"
            defaultValue={member.role}
            disabled={isSelf || rolePending}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="h-9 rounded-lg border border-zinc-300 bg-white px-2 text-xs font-medium disabled:opacity-60"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </form>
        {roleState?.message && !roleState.ok ? (
          <p className="mt-1 text-xs text-red-600">{roleState.message}</p>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            member.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {member.status === "active" ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-xs text-zinc-400">—</span>
        ) : (
          <form action={statusAction}>
            <input type="hidden" name="userId" value={member.id} />
            <input type="hidden" name="nextStatus" value={nextStatus} />
            <button
              type="submit"
              disabled={statusPending}
              className="text-xs font-semibold text-[#0a9f93] hover:text-[#08978d] disabled:opacity-60"
            >
              {member.status === "active" ? "Desativar" : "Reativar"}
            </button>
          </form>
        )}
        {statusState?.message && !statusState.ok ? (
          <p className="mt-1 text-xs text-red-600">{statusState.message}</p>
        ) : null}
      </td>
    </tr>
  );
}
