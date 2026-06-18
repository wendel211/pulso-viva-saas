"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";

import { recalculateRisk } from "@/lib/actions/risk";
import { Button } from "@/components/ui/button";

export function RiskRecalculateButton() {
  const [state, action, pending] = useActionState(recalculateRisk, undefined);

  return (
    <form action={action} className="flex items-center gap-3">
      <Button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-black font-semibold text-white disabled:opacity-60"
      >
        <RefreshCw
          className={`mr-2 size-4 ${pending ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        {pending ? "Calculando..." : "Recalcular scores"}
      </Button>
      {state?.message ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
