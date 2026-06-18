import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { verifySession } from "@/lib/dal";
import { ImportForm } from "@/components/import-form";

export default async function ImportPage() {
  await verifySession();

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Voltar ao dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">Importar dados</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Traga sua fila e agenda para o Hub de Acesso. Validamos cada linha e
          apontamos os erros antes de gravar.
        </p>

        <section className="mt-8 rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
          <ImportForm />
        </section>
      </div>
    </main>
  );
}
