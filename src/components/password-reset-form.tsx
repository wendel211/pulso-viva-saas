"use client";

import { useActionState } from "react";
import { KeyRound, Mail, CheckCircle2 } from "lucide-react";

import { requestPasswordReset } from "@/lib/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordResetForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  return (
    <section className="w-full max-w-[390px] rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.09)] sm:p-8">
      <div className="mb-8">
        <div className="mb-5 inline-flex size-10 items-center justify-center rounded-xl bg-[#e6fbf8] text-[#0a9f93]">
          <KeyRound className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-950">
          Recuperar senha
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Informe seu e-mail e enviaremos as instruções de redefinição.
        </p>
      </div>

      {state?.ok ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            Se houver uma conta com este e-mail, você receberá um link de
            redefinição em instantes.
          </p>
        </div>
      ) : (
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-900">
              E-mail corporativo
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nome@hospital.com.br"
                className="h-12 rounded-xl border-zinc-300 bg-[#f3f6fa] pl-10 text-base text-zinc-950 placeholder:text-zinc-500 focus-visible:border-[#22d6c8] focus-visible:ring-[#22d6c8]/25"
              />
            </div>
            {state?.error ? (
              <p className="text-xs text-red-600">{state.error}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-14 w-full rounded-xl bg-black text-base font-semibold text-white hover:bg-zinc-900 disabled:opacity-60"
          >
            {pending ? "Enviando..." : "Enviar instruções"}
          </Button>
        </form>
      )}

      <p className="mt-7 text-center text-sm text-zinc-600">
        Lembrou a senha?{" "}
        <a
          href="/login"
          className="font-semibold text-[#10bfb3] transition-colors hover:text-[#08978d]"
        >
          Voltar ao login
        </a>
      </p>
    </section>
  );
}
