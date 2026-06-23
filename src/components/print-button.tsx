"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900"
    >
      <Printer className="size-4" aria-hidden="true" />
      Exportar / Imprimir PDF
    </button>
  );
}
