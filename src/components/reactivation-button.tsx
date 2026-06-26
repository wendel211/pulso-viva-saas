"use client";

import { useActionState } from "react";
import { PhoneCall } from "lucide-react";

import { createReactivationTask } from "@/lib/actions/abandono";
import { Button } from "@/components/ui/button";

export function ReactivationButton({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string | null;
}) {
  const [state, action, pending] = useActionState(
    createReactivationTask,
    undefined,
  );

  return (
    <form action={action}>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="patientName" value={patientName ?? ""} />
      <Button
        type="submit"
        disabled={pending || state?.ok === true}
        className="h-8 rounded-lg bg-[#0a9f93] px-3 text-xs font-semibold text-white hover:bg-[#08877d] disabled:opacity-60"
      >
        <PhoneCall className="mr-1.5 size-3.5" aria-hidden="true" />
        {state?.ok ? "Tarefa criada ✓" : pending ? "Gerando…" : "Reativar"}
      </Button>
    </form>
  );
}
