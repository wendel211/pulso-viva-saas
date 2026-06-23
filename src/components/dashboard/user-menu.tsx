"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Clock, LogOut, Mail, ShieldCheck } from "lucide-react";

import { logout } from "@/lib/actions/auth";

type UserMenuProps = {
  userName: string;
  userEmail: string;
  roleLabel: string;
  lastLoginText: string;
};

export function UserMenu({
  userName,
  userEmail,
  roleLabel,
  lastLoginText,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PV";

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`group flex items-center gap-2.5 rounded-full border bg-white py-1 pl-1 pr-3 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0 ${
          open
            ? "border-[#2dd4bf] ring-2 ring-[#2dd4bf]/20"
            : "border-slate-200 hover:border-[#2dd4bf]/60"
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#0a9f93] text-[13px] font-bold tracking-[.3px] text-white shadow-sm ring-2 ring-white">
          {initials}
        </span>
        <span className="hidden text-[13.5px] font-semibold text-slate-800 transition-colors group-hover:text-[#0a9f93] sm:block">
          {userName}
        </span>
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${open ? "rotate-180 text-[#0a9f93]" : "text-slate-400 group-hover:text-[#0a9f93]"}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_50px_rgba(15,27,42,0.16)]">
          {/* Cabeçalho do perfil */}
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#f1fbfa] to-[#eef4f8] px-5 py-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#0a9f93] text-base font-bold text-white shadow-sm">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {userName}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#0a9f93]">
                <ShieldCheck className="size-3" aria-hidden="true" />
                {roleLabel}
              </p>
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-3 px-5 py-4">
            <InfoRow icon={<Mail className="size-4" />} label="E-mail">
              <span className="truncate">{userEmail}</span>
            </InfoRow>
            <InfoRow icon={<Clock className="size-4" />} label="Último acesso">
              {lastLoginText}
            </InfoRow>
          </div>

          {/* Sair */}
          <div className="border-t border-slate-100 p-2">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sair da conta
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="truncate text-[13px] font-semibold text-slate-800">
          {children}
        </p>
      </div>
    </div>
  );
}
