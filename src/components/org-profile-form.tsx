"use client";

import { useActionState } from "react";
import { Building2, Landmark } from "lucide-react";

import { updateOrgProfile } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Segment } from "@/lib/segment";

type Props = {
  segment: Segment;
  slotValueReais: number;
};

export function OrgProfileForm({ segment, slotValueReais }: Props) {
  const [state, action, pending] = useActionState(updateOrgProfile, undefined);

  return (
    <form action={action} className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-900">
          Tipo de operação
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4 has-[:checked]:border-[#22d6c8] has-[:checked]:bg-[#f1fbfa]">
            <input
              type="radio"
              name="segment"
              value="privado"
              defaultChecked={segment === "privado"}
              className="mt-1 accent-[#0a9f93]"
            />
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Building2 className="size-4 text-[#0a9f93]" aria-hidden="true" />
                Clínica privada
              </span>
              <span className="mt-1 block text-xs text-zinc-500">
                Métricas em R$: receita recuperada, ocupação da agenda, recall.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4 has-[:checked]:border-[#22d6c8] has-[:checked]:bg-[#f1fbfa]">
            <input
              type="radio"
              name="segment"
              value="publico"
              defaultChecked={segment === "publico"}
              className="mt-1 accent-[#0a9f93]"
            />
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Landmark className="size-4 text-[#0a9f93]" aria-hidden="true" />
                Público / SUS
              </span>
              <span className="mt-1 block text-xs text-zinc-500">
                Foco em acesso, equidade, busca ativa e prestação de contas.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slotValue" className="text-sm font-medium text-zinc-900">
          Valor médio por vaga (R$)
        </Label>
        <Input
          id="slotValue"
          name="slotValue"
          type="number"
          min={0}
          step="0.01"
          defaultValue={slotValueReais}
          className="h-11 w-40 rounded-xl border-zinc-300 bg-[#f3f6fa] text-base"
        />
        <p className="text-xs text-zinc-500">
          Usado para estimar receita / custo público preservado no painel de
          impacto.
        </p>
      </div>

      {state?.message ? (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-black px-5 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}
