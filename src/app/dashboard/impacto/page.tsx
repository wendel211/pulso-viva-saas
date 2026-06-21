import Link from "next/link";
import { ArrowLeft, CalendarCheck2, Gauge, PiggyBank, ShieldOff } from "lucide-react";

import { getSustainableImpact } from "@/lib/queries/impact";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#0a9f93]">{icon}</div>
      <p className="mt-4 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

export default async function ImpactPage() {
  const impact = await getSustainableImpact();

  return (
    <main className="min-h-screen bg-[#eef2f7] px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Voltar ao dashboard
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold">Impacto sustentável</h1>
          <p className="mt-1 text-sm text-zinc-600">
            O que a inteligência de acesso já devolveu para a operação.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<CalendarCheck2 className="size-5" aria-hidden="true" />}
            label="Vagas recuperadas"
            value={String(impact.recoveredSlots)}
            hint="Encaixes feitos a partir de vagas ociosas."
          />
          <MetricCard
            icon={<ShieldOff className="size-5" aria-hidden="true" />}
            label="Faltas evitadas"
            value={String(impact.avoidedNoShows)}
            hint="Confirmados ou reagendados antes de virar no-show."
          />
          <MetricCard
            icon={<Gauge className="size-5" aria-hidden="true" />}
            label="Capacidade aproveitada"
            value={`${impact.capacityUsedPercent}%`}
            hint="Percentual de agenda com comparecimento real."
          />
          <MetricCard
            icon={<PiggyBank className="size-5" aria-hidden="true" />}
            label="Custo preservado (estimado)"
            value={formatBRL(impact.preservedCostCents)}
            hint="Vagas recuperadas + faltas evitadas × valor médio da vaga."
          />
        </section>

        <p className="mt-6 text-xs text-zinc-400">
          Estimativa baseada em valor médio de vaga de R$ 150,00. Configurável
          por organização em versões futuras.
        </p>
      </div>
    </main>
  );
}
