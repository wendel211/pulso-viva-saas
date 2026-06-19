"use client";

import { useActionState } from "react";
import { UserCheck } from "lucide-react";

import { fitPatient } from "@/lib/actions/ranking";
import { Button } from "@/components/ui/button";
import type { RankedCandidate } from "@/lib/ranking/engine";

type Props = {
  appointmentId: string;
  candidate: RankedCandidate;
};

export function FitPatientButton({ appointmentId, candidate }: Props) {
  const [state, action, pending] = useActionState(fitPatient, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={candidate.patientId} />
      <input type="hidden" name="requestId" value={candidate.requestId} />
      <input
        type="hidden"
        name="patientName"
        value={candidate.patientName ?? ""}
      />
      <Button
        type="submit"
        disabled={pending || state?.ok === true}
        className="h-8 rounded-lg bg-[#22d6c8] px-3 text-xs font-semibold text-[#071220] hover:bg-[#1abfb4] disabled:opacity-60"
      >
        <UserCheck className="mr-1.5 size-3.5" aria-hidden="true" />
        {state?.ok ? "Encaixado ✓" : pending ? "Registrando…" : "Encaixar"}
      </Button>
      {state?.message && !state.ok ? (
        <p className="mt-1 text-xs text-red-500">{state.message}</p>
      ) : null}
    </form>
  );
}
