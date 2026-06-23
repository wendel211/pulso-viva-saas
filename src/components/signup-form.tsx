"use client";

import { useActionState } from "react";
import { Building2, ShieldCheck } from "lucide-react";

import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <section className="w-full max-w-[420px] rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.09)] sm:p-8">
      <div className="mb-7">
        <div className="mb-5 inline-flex size-10 items-center justify-center rounded-xl bg-[#e6fbf8] text-[#0a9f93]">
          <Building2 className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-950">
          Crie sua organização
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Configure sua unidade e comece a importar dados em minutos.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName" className="text-sm font-medium text-zinc-900">
            Nome da organização
          </Label>
          <Input
            id="organizationName"
            name="organizationName"
            placeholder="Clínica Vida Plena"
            className="h-12 rounded-xl border-zinc-300 bg-[#f3f6fa] text-base"
          />
          {state?.errors?.organizationName ? (
            <p className="text-xs text-red-600">
              {state.errors.organizationName[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="managerName" className="text-sm font-medium text-zinc-900">
            Seu nome
          </Label>
          <Input
            id="managerName"
            name="managerName"
            placeholder="Maria Souza"
            className="h-12 rounded-xl border-zinc-300 bg-[#f3f6fa] text-base"
          />
          {state?.errors?.managerName ? (
            <p className="text-xs text-red-600">{state.errors.managerName[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-zinc-900">
            E-mail corporativo
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@hospital.com.br"
            className="h-12 rounded-xl border-zinc-300 bg-[#f3f6fa] text-base"
          />
          {state?.errors?.email ? (
            <p className="text-xs text-red-600">{state.errors.email[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-zinc-900">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres, com letra e número"
            className="h-12 rounded-xl border-zinc-300 bg-[#f3f6fa] text-base"
          />
          {state?.errors?.password ? (
            <ul className="text-xs text-red-600">
              {state.errors.password.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {state?.message ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.message}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-14 w-full rounded-xl bg-black text-base font-semibold text-white disabled:opacity-60"
        >
          <ShieldCheck className="mr-2 size-4" aria-hidden="true" />
          {pending ? "Criando..." : "Criar organização e entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Já tem conta?{" "}
        <a
          href="/login"
          className="font-semibold text-[#10bfb3] hover:text-[#08978d]"
        >
          Fazer login
        </a>
      </p>
    </section>
  );
}
