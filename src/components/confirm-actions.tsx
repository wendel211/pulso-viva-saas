"use client";

import { useState, useTransition } from "react";
import { Check, X, CalendarCheck2, CalendarX2 } from "lucide-react";

import { confirmByToken, cancelByToken, type ConfirmResult } from "@/lib/actions/confirm";

export function ConfirmActions({
  token,
  initialStatus,
}: {
  token: string;
  initialStatus: string;
}) {
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [pending, startTransition] = useTransition();

  const alreadyDone =
    initialStatus === "confirmed" || initialStatus === "cancelled";

  const done = result?.ok || alreadyDone;

  function run(action: (t: string) => Promise<ConfirmResult>) {
    startTransition(async () => {
      setResult(await action(token));
    });
  }

  if (done) {
    const confirmed = result?.status === "confirmed" || initialStatus === "confirmed";
    return (
      <div
        className={`flex flex-col items-center gap-3 rounded-2xl p-6 text-center ${
          confirmed ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-700"
        }`}
      >
        {confirmed ? (
          <CalendarCheck2 className="size-8" aria-hidden="true" />
        ) : (
          <CalendarX2 className="size-8" aria-hidden="true" />
        )}
        <p className="text-sm font-medium">
          {result?.message ??
            (confirmed
              ? "Presença confirmada. Obrigado!"
              : "Consulta cancelada.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {result && !result.ok ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
          {result.message}
        </p>
      ) : null}

      <button
        type="button"
        disabled={pending}
        onClick={() => run(confirmByToken)}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0a9f93] text-base font-semibold text-white transition-colors hover:bg-[#08877d] disabled:opacity-60"
      >
        <Check className="size-5" aria-hidden="true" />
        Confirmar presença
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(cancelByToken)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      >
        <X className="size-4" aria-hidden="true" />
        Não poderei comparecer
      </button>
    </div>
  );
}
