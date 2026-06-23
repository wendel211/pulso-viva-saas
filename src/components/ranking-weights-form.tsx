"use client";

import { useActionState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { updateRankingWeights } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  /** Pesos atuais em fração 0-1; o form exibe como inteiros 0-100. */
  weights: {
    waitTime: number;
    priority: number;
    reliability: number;
    contact: number;
  };
};

const FIELDS: {
  name: keyof Props["weights"];
  label: string;
  hint: string;
}[] = [
  { name: "waitTime", label: "Tempo de espera", hint: "Quanto mais tempo em fila, maior prioridade." },
  { name: "priority", label: "Prioridade clínica", hint: "Peso da prioridade declarada na solicitação." },
  { name: "reliability", label: "Confiabilidade", hint: "Inverso do risco de falta do paciente." },
  { name: "contact", label: "Contato disponível", hint: "Penaliza quem não tem telefone para chamar." },
];

export function RankingWeightsForm({ weights }: Props) {
  const [state, action, pending] = useActionState(
    updateRankingWeights,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-zinc-900"
            >
              {field.label}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min={0}
                max={100}
                defaultValue={Math.round(weights[field.name] * 100)}
                className="h-11 w-24 rounded-xl border-zinc-300 bg-[#f3f6fa] text-base"
              />
              <span className="text-sm text-zinc-400">peso relativo</span>
            </div>
            <p className="text-xs text-zinc-500">{field.hint}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        Os valores são relativos: o sistema normaliza automaticamente para que
        a soma represente 100%.
      </p>

      {state?.message ? (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
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
        <SlidersHorizontal className="mr-2 size-4" aria-hidden="true" />
        {pending ? "Salvando..." : "Salvar pesos"}
      </Button>
    </form>
  );
}
