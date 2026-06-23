import { BrandMark } from "@/components/brand-mark";
import { PasswordResetForm } from "@/components/password-reset-form";

export default function RecoverPasswordPage() {
  return (
    <main className="min-h-screen bg-[#eef2f7] text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[1.82fr_1fr]">
        <section className="relative hidden overflow-hidden bg-[#071220] px-10 py-10 text-white lg:flex lg:flex-col lg:items-center lg:justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_46%_31%,rgba(18,72,96,0.42),transparent_34%),radial-gradient(circle_at_67%_62%,rgba(34,214,200,0.10),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%)]" />
          <div className="relative z-10">
            <BrandMark />
            <p className="mt-8 max-w-sm text-center text-sm leading-6 text-slate-300">
              Recupere seu acesso com segurança e volte a gerenciar sua
              operação em minutos.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 lg:hidden">
              <div className="rounded-2xl bg-[#071220] px-6 py-7">
                <BrandMark compact />
              </div>
            </div>
            <PasswordResetForm />
          </div>
        </section>
      </div>
    </main>
  );
}
