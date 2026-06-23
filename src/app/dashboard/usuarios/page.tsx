import { ShieldAlert } from "lucide-react";

import { getTeamMembers, canManageTeam } from "@/lib/queries/team";
import { verifySession } from "@/lib/dal";
import { InviteUserForm } from "@/components/invite-user-form";
import { TeamMemberRow } from "@/components/team-member-row";

export default async function TeamPage() {
  const [allowed, members, session] = await Promise.all([
    canManageTeam(),
    getTeamMembers(),
    verifySession(),
  ]);

  if (!allowed) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl rounded-[20px] border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-800">
          <ShieldAlert className="mx-auto mb-2 size-6" aria-hidden="true" />
          Apenas gestores podem gerenciar usuários e papéis.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Usuários e papéis</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Convide pessoas para sua organização e gerencie permissões (RF12).
        </p>

        <section className="mt-8 rounded-[20px] border border-[#eaeff5] bg-white p-6 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <h2 className="mb-4 text-sm font-bold text-zinc-900">
            Convidar novo usuário
          </h2>
          <InviteUserForm />
        </section>

        <section className="mt-6 overflow-hidden rounded-[20px] border border-[#eaeff5] bg-white shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left">Usuário</th>
                <th className="px-4 py-3 text-left">Papel</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {members.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  isSelf={member.id === session.userId}
                />
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
