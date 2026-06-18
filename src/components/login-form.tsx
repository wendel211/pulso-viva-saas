"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";

import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <section className="w-full max-w-[390px] rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.09)] sm:p-8">
      <div className="mb-8">
        <div className="mb-5 inline-flex size-10 items-center justify-center rounded-xl bg-[#e6fbf8] text-[#0a9f93]">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-950">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Acesse sua conta para gerenciar sua unidade.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-zinc-900"
          >
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
          {state?.errors?.email ? (
            <p className="text-xs text-red-600">{state.errors.email[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-zinc-900"
            >
              Senha
            </Label>
            <a
              href="/recuperar-senha"
              className="text-xs font-semibold text-[#10bfb3] transition-colors hover:text-[#08978d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d6c8]/35"
            >
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="********"
              className="h-12 rounded-xl border-zinc-300 bg-[#f3f6fa] pr-12 text-base text-zinc-950 placeholder:text-zinc-500 focus-visible:border-[#22d6c8] focus-visible:ring-[#22d6c8]/25"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-lg text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-800"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          {state?.errors?.password ? (
            <p className="text-xs text-red-600">{state.errors.password[0]}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Checkbox
            id="remember"
            name="remember"
            className="size-4 rounded-full border-zinc-300 data-checked:border-[#22d6c8] data-checked:bg-[#22d6c8]"
          />
          <Label
            htmlFor="remember"
            className="cursor-pointer text-sm font-normal text-zinc-600"
          >
            Manter conectado
          </Label>
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
          className="h-14 w-full rounded-xl bg-black text-base font-semibold text-white shadow-[0_12px_22px_rgba(0,0,0,0.16)] transition-transform hover:-translate-y-0.5 hover:bg-zinc-900 disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar no Sistema"}
        </Button>
      </form>

      <Separator className="my-7 bg-zinc-200" />

      <p className="text-center text-sm text-zinc-600">
        Não tem acesso?{" "}
        <a
          href="/implantacao"
          className="font-semibold text-[#10bfb3] transition-colors hover:text-[#08978d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d6c8]/35"
        >
          Falar com implantação
        </a>
      </p>
    </section>
  );
}
