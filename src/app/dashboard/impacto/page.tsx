import { CalendarCheck2, Gauge, PiggyBank, ShieldOff } from "lucide-react";

import { getSustainableImpact } from "@/lib/queries/impact";
import { getOrgProfile } from "@/lib/queries/settings";
import { segmentLabels } from "@/lib/segment";

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
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        highlight
          ? "border-[#22d6c8]/40 bg-[#f1fbfa]"
          : "border-black/5 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-[#0a9f93]">{icon}</div>
      <p className="mt-4 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

export default async function ImpactPage() {
  const [impact, profile] = await Promise.all([
    getSustainableImpact(),
    getOrgProfile(),
  ]);
  const L = segmentLabels(profile.segment);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">{L.impactTitle}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          O que a inteligência de acesso já devolveu para a operação.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<CalendarCheck2 className="size-5" aria-hidden="true" />}
            label={L.recoveredSlots}
            value={String(impact.recoveredSlots)}
            hint="Encaixes feitos a partir de vagas ociosas."
          />
          <MetricCard
            icon={<ShieldOff className="size-5" aria-hidden="true" />}
            label={L.avoidedNoShows}
            value={String(impact.avoidedNoShows)}
            hint="Confirmados ou reagendados antes de virar no-show."
          />
          <MetricCard
            icon={<Gauge className="size-5" aria-hidden="true" />}
            label={L.capacity}
            value={`${impact.capacityUsedPercent}%`}
            hint="Percentual de agenda com comparecimento real."
          />
          <MetricCard
            highlight
            icon={<PiggyBank className="size-5" aria-hidden="true" />}
            label={L.preservedCost}
            value={formatBRL(impact.preservedCostCents)}
            hint={L.costHint}
          />
        </section>

        <p className="mt-6 text-xs text-zinc-400">
          Valor médio da vaga: {formatBRL(profile.slotValueCents)} — ajustável em
          Configurações › Perfil da organização.
        </p>
      </div>
    </div>
  );
}
