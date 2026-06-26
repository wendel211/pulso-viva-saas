"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarCheck,
  Gauge,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  Scale,
  Settings,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

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
  { label: "Reativação / busca ativa", href: "/dashboard/reativacao", icon: HeartHandshake },
  { label: "Equidade de acesso", href: "/dashboard/equidade", icon: Scale },
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

export function DashboardSidebar() {
  const pathname = usePathname();

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
    </aside>
  );
}
