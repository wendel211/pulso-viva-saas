"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarCheck,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import { logout } from "@/lib/actions/auth";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const OPERATION_ITEMS: NavItem[] = [
  { label: "Painel geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Filas", href: "/dashboard/filas", icon: ListChecks },
  { label: "Importar dados", href: "/dashboard/importar", icon: UploadCloud },
  { label: "Qualidade dos dados", href: "/dashboard/qualidade", icon: ShieldCheck },
  { label: "Encaixe inteligente", href: "/dashboard/encaixe", icon: CalendarCheck },
];

const INTELLIGENCE_ITEMS: NavItem[] = [
  { label: "Risco de falta", href: "/dashboard/risco", icon: Activity },
  { label: "Previsão de gargalo", href: "/dashboard/gargalos", icon: Gauge },
  { label: "Impacto sustentável", href: "/dashboard/impacto", icon: HeartPulse },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
        active
          ? "bg-[#22d6c8] text-[#06212a]"
          : "text-[#9fb2c2] hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className={`size-4 ${active ? "text-[#06212a]" : "text-[#5e7689]"}`} />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-2 text-[10px] font-bold tracking-[1.3px] text-[#4d6175]">
      {children}
    </div>
  );
}

export function DashboardSidebar({
  userName,
  userRoleLabel,
}: {
  userName: string;
  userRoleLabel: string;
}) {
  const pathname = usePathname();
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PV";

  return (
    <aside className="sticky top-0 flex h-screen w-[262px] flex-none flex-col bg-gradient-to-b from-[#0b1622] via-[#0c1a28] to-[#0a1622] px-[18px] py-[26px] text-[#cdd8e4]">
      <div className="flex items-center gap-[11px] px-2 pb-1">
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="38" height="38" rx="11" fill="#0e2230" stroke="#1c3a4c" />
          <path
            d="M6 21h6l3-9 5 17 3-12 2 4h9"
            stroke="#2dd4bf"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <div className="leading-none">
          <div className="text-[19px] font-extrabold tracking-tight">
            <span className="text-white">Pulso</span>
            <span className="text-[#2dd4bf]">Viva</span>
          </div>
          <div className="mt-[3px] text-[9.5px] font-semibold tracking-[1.4px] text-[#5e7689]">
            GESTÃO DE ACESSO EM SAÚDE
          </div>
        </div>
      </div>

      <nav className="mt-[30px] flex flex-col gap-[3px] overflow-y-auto">
        <GroupLabel>OPERAÇÃO</GroupLabel>
        {OPERATION_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <div className="pt-[22px]">
          <GroupLabel>INTELIGÊNCIA</GroupLabel>
        </div>
        {INTELLIGENCE_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      <form action={logout} className="mt-auto">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-[14px] border border-[#16293a] bg-white/[0.02] px-3 py-[11px] text-left transition-colors hover:bg-white/5"
        >
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full border border-[#244a58] bg-[#11303d] text-[13px] font-bold tracking-[.3px] text-[#2dd4bf]">
            {initials}
          </span>
          <span className="min-w-0 flex-1 leading-[1.35]">
            <span className="block truncate text-[13px] font-bold text-[#e8eef4]">
              {userName}
            </span>
            <span className="block truncate text-[11px] text-[#5e7689]">
              {userRoleLabel}
            </span>
          </span>
          <LogOut className="size-4 shrink-0 text-[#5e7689]" aria-hidden="true" />
        </button>
      </form>
    </aside>
  );
}
