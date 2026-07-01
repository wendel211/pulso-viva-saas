"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

type Props = {
  token: string;
  patientName: string | null;
  contact: string | null;
  specialty: string | null;
  scheduledAt: string | null; // ISO
};

function buildMessage(p: Props, url: string) {
  const first = p.patientName?.split(" ")[0] ?? "";
  const when = p.scheduledAt
    ? new Date(p.scheduledAt).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";
  return (
    `Olá${first ? " " + first : ""}! ` +
    `Você tem consulta de ${p.specialty ?? "saúde"}${when ? " em " + when : ""}. ` +
    `Confirme ou remarque aqui: ${url}`
  );
}

export function ConfirmLinkButton(props: Props) {
  const [copied, setCopied] = useState(false);

  const path = `/confirmar?t=${encodeURIComponent(props.token)}`;
  const url =
    typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const message = buildMessage(props, url);

  const waNumber = props.contact?.replace(/\D/g, "");
  const waHref = waNumber
    ? `https://wa.me/55${waNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {copied ? "Copiado" : "Copiar"}
      </button>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a9f93] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#08877d]"
      >
        <MessageCircle className="size-3.5" aria-hidden="true" />
        WhatsApp
      </a>
    </div>
  );
}
