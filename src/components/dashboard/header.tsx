import { LogOut } from "lucide-react";

import { logout } from "@/lib/actions/auth";

type DashboardHeaderProps = {
  userName: string;
  userRoleLabel: string;
  userEmail?: string;
};

/**
 * Topbar do painel — conecta visualmente com a sidebar (mesma linha do topo).
 * Exibe quem está logado e um botão de sair no canto superior direito.
 */
export function DashboardHeader({
  userName,
  userRoleLabel,
  userEmail,
}: DashboardHeaderProps) {
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PV";

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-end gap-4 border-b border-[#e2e8f0] bg-[#eef2f7]/85 px-8 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#cfe6e2] bg-[#e6fbf8] text-[13px] font-bold tracking-[.3px] text-[#0a9f93]">
          {initials}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-[13.5px] font-bold text-[#0f1b2a]">
            {userName}
          </span>
          <span className="truncate text-[11.5px] text-[#64748b]">
            {userEmail ?? userRoleLabel}
          </span>
        </span>
      </div>

      <div className="h-7 w-px bg-[#e2e8f0]" aria-hidden="true" />

      <form action={logout}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </button>
      </form>
    </header>
  );
}
