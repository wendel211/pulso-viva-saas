/**
 * Índice de Equidade de Acesso.
 *
 * Mede se o tempo de espera é distribuído de forma justa entre grupos
 * (faixa etária, especialidade, território, prioridade). Equidade é
 * princípio do SUS — aqui ela vira número gerenciável e auditável.
 *
 * Método (baseline explicável): para cada dimensão, comparamos a espera
 * média entre os grupos. Quanto mais dispersa a espera (uns esperam muito
 * mais que outros), menor a equidade. Usamos o coeficiente de variação
 * ponderado pelo tamanho dos grupos, convertido em um índice 0–100.
 */

export type EquityRecord = {
  ageBand: string | null;
  specialty: string | null;
  territory: string | null;
  priority: string | null;
  waitDays: number;
};

export type GroupStat = {
  label: string;
  avgWaitDays: number;
  count: number;
};

export type DimensionBreakdown = {
  key: string;
  label: string;
  groups: GroupStat[]; // ordenado do maior tempo de espera ao menor
  /** Razão entre a espera do grupo mais penalizado e a do menos penalizado. */
  disparityRatio: number;
  mostPenalized: string | null;
  /** Coeficiente de variação ponderado (0–1+); maior = mais desigual. */
  inequality: number;
};

export type EquityReport = {
  equityIndex: number; // 0–100, maior = mais equitativo
  overallAvgWaitDays: number;
  totalRecords: number;
  dimensions: DimensionBreakdown[];
};

const MIN_GROUP = 3; // ignora grupos pequenos demais para serem significativos

const DIMENSIONS: { key: keyof EquityRecord; label: string }[] = [
  { key: "ageBand", label: "Faixa etária" },
  { key: "specialty", label: "Especialidade" },
  { key: "territory", label: "Território" },
  { key: "priority", label: "Prioridade" },
];

export function ageBand(age: number | null | undefined): string | null {
  if (age == null) return null;
  if (age < 18) return "0–17";
  if (age < 40) return "18–39";
  if (age < 60) return "40–59";
  return "60+";
}

function summarizeDimension(
  records: EquityRecord[],
  key: keyof EquityRecord,
  label: string,
): DimensionBreakdown | null {
  const buckets = new Map<string, { sum: number; n: number }>();
  for (const r of records) {
    const v = r[key];
    if (typeof v !== "string" || v.trim() === "") continue;
    const b = buckets.get(v) ?? { sum: 0, n: 0 };
    b.sum += r.waitDays;
    b.n += 1;
    buckets.set(v, b);
  }

  const groups: GroupStat[] = [...buckets.entries()]
    .filter(([, b]) => b.n >= MIN_GROUP)
    .map(([labelG, b]) => ({
      label: labelG,
      avgWaitDays: b.sum / b.n,
      count: b.n,
    }));

  if (groups.length < 2) return null; // sem comparação possível

  groups.sort((a, b) => b.avgWaitDays - a.avgWaitDays);

  const totalN = groups.reduce((s, g) => s + g.count, 0);
  const mean = groups.reduce((s, g) => s + g.avgWaitDays * g.count, 0) / totalN;
  const variance =
    groups.reduce(
      (s, g) => s + g.count * (g.avgWaitDays - mean) ** 2,
      0,
    ) / totalN;
  const inequality = mean > 0 ? Math.sqrt(variance) / mean : 0;

  const worst = groups[0].avgWaitDays;
  const best = groups[groups.length - 1].avgWaitDays;
  const disparityRatio = best > 0 ? worst / best : 1;

  return {
    key: String(key),
    label,
    groups,
    disparityRatio,
    mostPenalized: groups[0].label,
    inequality,
  };
}

export function computeEquity(records: EquityRecord[]): EquityReport {
  const valid = records.filter((r) => Number.isFinite(r.waitDays));
  const totalRecords = valid.length;
  const overallAvgWaitDays =
    totalRecords > 0
      ? valid.reduce((s, r) => s + r.waitDays, 0) / totalRecords
      : 0;

  const dimensions: DimensionBreakdown[] = [];
  for (const d of DIMENSIONS) {
    const dim = summarizeDimension(valid, d.key, d.label);
    if (dim) dimensions.push(dim);
  }

  // Índice: 100 menos a desigualdade média entre as dimensões (em %).
  const avgInequality =
    dimensions.length > 0
      ? dimensions.reduce((s, d) => s + d.inequality, 0) / dimensions.length
      : 0;
  const equityIndex = Math.max(
    0,
    Math.min(100, Math.round(100 - avgInequality * 100)),
  );

  return { equityIndex, overallAvgWaitDays, totalRecords, dimensions };
}
