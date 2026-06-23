"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import { inviteUser } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_OPTIONS = [
  { value: "operator", label: "Operador de acesso" },
  { value: "analyst", label: "Analista/coordenação" },
  { value: "org_manager", label: "Gestor da organização" },
  { value: "dpo_auditor", label: "DPO/Auditor" },
];

export function InviteUserForm() {
  const [state, action, pending] = useActionState(inviteUser, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-zinc-700">
            Nome
          </Label>
          <Input id="name" name="name" placeholder="Nome completo" className="h-10" />
          {state?.errors?.name ? (
            <p className="text-xs text-red-600">{state.errors.name[0]}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-zinc-700">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@org.com.br"
            className="h-10"
          />
          {state?.errors?.email ? (
            <p className="text-xs text-red-600">{state.errors.email[0]}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-xs font-medium text-zinc-700">
            Papel
          </Label>
          <select
            id="role"
            name="role"
            defaultValue="operator"
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.message ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 rounded-xl bg-black px-4 font-semibold text-white disabled:opacity-60"
      >
        <UserPlus className="mr-2 size-4" aria-hidden="true" />
        {pending ? "Convidando..." : "Convidar usuário"}
      </Button>
    </form>
  );
}
