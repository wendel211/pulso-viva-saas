import { ImportForm } from "@/components/import-form";

export default function ImportPage() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Importar dados</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Traga sua fila e agenda para o Hub de Acesso. Validamos cada linha e
          apontamos os erros antes de gravar.
        </p>

        <section className="mt-8 rounded-[20px] border border-[#eaeff5] bg-white p-7 shadow-[0_1px_3px_rgba(15,27,42,0.04)]">
          <ImportForm />
        </section>
      </div>
    </div>
  );
}
