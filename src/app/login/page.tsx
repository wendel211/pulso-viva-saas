import { BrandMark } from "@/components/brand-mark";
import { ClinicalVisual } from "@/components/clinical-visual";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#eef2f7] text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[1.82fr_1fr]">
        <section className="relative hidden overflow-hidden bg-[#071220] px-10 py-10 text-white lg:flex lg:flex-col lg:items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_46%_31%,rgba(18,72,96,0.42),transparent_34%),radial-gradient(circle_at_67%_62%,rgba(34,214,200,0.10),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%)]" />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#080d1b] to-transparent" />
          <div className="relative z-10 flex h-full w-full max-w-[820px] flex-col items-center justify-between">
            <div className="pt-[13vh]">
              <BrandMark />
              <ClinicalVisual />
            </div>

            <footer className="w-full border-t border-white/10 pt-8 text-center">
              <div className="flex items-center justify-center gap-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>Preveja gargalos</span>
                <span className="size-1 rounded-full bg-[#22d6c8]/60" />
                <span>Reduza faltas</span>
                <span className="size-1 rounded-full bg-[#22d6c8]/60" />
                <span>Recupere vagas</span>
              </div>
              <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                © 2026 PulsoViva. Tecnologia para gestão de saúde de alta
                precisão.
              </p>
            </footer>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 lg:hidden">
              <div className="rounded-2xl bg-[#071220] px-6 py-7">
                <BrandMark compact />
              </div>
            </div>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
