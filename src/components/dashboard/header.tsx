import { LogOut } from "lucide-react";

import { logout } from "@/lib/actions/auth";

type DashboardHeaderProps = {
  userName: string;
  userRoleLabel: string;
  userEmail?: string;
};

/**
 * Topbar do painel — usa as cores da sidebar (navy escuro) para formar uma
 * faixa contínua no topo. Exibe quem está logado e um botão de sair à direita.
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
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-end gap-4 border-b border-[#16293a] bg-gradient-to-r from-[#0b1622] to-[#0c1a28] px-8 text-[#cdd8e4]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#244a58] bg-[#11303d] text-[13px] font-bold tracking-[.3px] text-[#2dd4bf]">
          {initials}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-[13.5px] font-bold text-[#e8eef4]">
            {userName}
          </span>
          <span className="truncate text-[11.5px] text-[#5e7689]">
            {userEmail ?? userRoleLabel}
          </span>
        </span>
      </div>

      <div className="h-7 w-px bg-[#16293a]" aria-hidden="true" />

      <form action={logout}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl border border-[#16293a] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-[#9fb2c2] transition-colors hover:border-[#5c2b2e] hover:bg-[#2a1215] hover:text-[#ff8a80]"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </button>
      </form>
    </header>
  );
}
