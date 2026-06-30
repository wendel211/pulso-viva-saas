import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

import { getRecommendations } from "@/lib/queries/recomendacoes";
import type { Recommendation } from "@/lib/recomendacoes/engine";

const PRIORITY_STYLES: Record<Recommendation["priority"], string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-zinc-100 text-zinc-600",
};

const PRIORITY_LABEL: Record<Recommendation["priority"], string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const DOT: Record<Recommendation["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-zinc-300",
};

export default async function RecommendationsPage() {
  const recs = await getRecommendations();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22d6c8] to-[#0a9f93] text-white shadow-sm">
            <Target className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Plano de ação</h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              A inteligência não só mostra o problema — ela diz o que fazer agora
              e estima o impacto. Ações priorizadas para a sua operação.
            </p>
          </div>
        </div>

        {recs.length === 0 ? (
          <div className="mt-10 rounded-[20px] border border-emerald-200 bg-emerald-50 p-8 text-center text-sm text-emerald-800">
            Nenhuma ação crítica no momento. A operação está sob controle.
          </div>
        ) : (
          <ol className="mt-8 space-y-3">
            {recs.map((rec, i) => (
              <li
                key={rec.id}
                className="rounded-[20px] border border-[#eaeff5] bg-white p-5 shadow-[0_1px_3px_rgba(15,27,42,0.04)]"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`size-2 rounded-full ${DOT[rec.priority]}`} />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                        {rec.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[rec.priority]}`}
                      >
                        Prioridade {PRIORITY_LABEL[rec.priority]}
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-base font-bold text-zinc-900">
                      {rec.title}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">{rec.detail}</p>
                    <p className="mt-2 inline-block rounded-lg bg-[#f1fbfa] px-2.5 py-1 text-sm font-semibold text-[#0a7d73]">
                      {rec.impact}
                    </p>
                  </div>
                  <Link
                    href={rec.href}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900"
                  >
                    Agir
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
