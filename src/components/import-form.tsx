"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";

import { importSpreadsheet } from "@/lib/actions/import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImportForm() {
  const [state, action, pending] = useActionState(importSpreadsheet, undefined);

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file" className="text-sm font-medium text-zinc-900">
            Planilha de fila/agenda (CSV ou XLSX)
          </Label>
          <Input
            id="file"
            name="file"
            type="file"
            accept=".csv,.xlsx,.xls"
            required
            className="h-12 rounded-xl border-zinc-300 bg-[#f3f6fa] text-sm"
          />
          <p className="text-xs text-zinc-500">
            Colunas reconhecidas: paciente, contato, especialidade, procedimento,
            unidade, data de agendamento, status, entre outras.
          </p>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xl bg-black font-semibold text-white disabled:opacity-60"
        >
          <UploadCloud className="mr-2 size-4" aria-hidden="true" />
          {pending ? "Importando..." : "Importar para o Hub"}
        </Button>
      </form>

      {state?.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {state?.errors && state.errors.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-900">
            Erros por linha
          </p>
          <ul className="max-h-64 space-y-1 overflow-auto text-xs text-amber-800">
            {state.errors.slice(0, 100).map((e, i) => (
              <li key={i}>
                Linha {e.row} · <span className="font-medium">{e.field}</span>:{" "}
                {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
