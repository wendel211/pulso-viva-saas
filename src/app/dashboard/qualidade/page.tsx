import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { getDataQualityReport, type QualityIssue } from "@/lib/queries/data-quality";

const SEVERITY_STYLES: Record<QualityIssue["severity"], string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

const SEVERITY_LABEL: Record<QualityIssue["severity"], string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export default async function DataQualityPage() {
  const report = await getDataQualityReport();
  const clean = report.issues.every((i) => i.count === 0);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Qualidade dos dados</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Avaliamos a base antes da IA: {report.totalPatients} paciente(s) e{" "}
              {report.totalRequests} solicitação(ões).
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Score de qualidade
            </p>
            <p className={`text-4xl font-semibold ${scoreColor(report.score)}`}>
              {report.score}
            </p>
          </div>
        </div>

        {clean ? (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            Nenhum problema relevante encontrado na base atual.
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {report.issues
              .filter((i) => i.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((issue) => (
                <li
                  key={issue.key}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className="size-4 text-amber-500"
                        aria-hidden="true"
                      />
                      <p className="font-medium text-zinc-900">{issue.label}</p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${SEVERITY_STYLES[issue.severity]}`}
                      >
                        {SEVERITY_LABEL[issue.severity]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {issue.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-2xl font-semibold text-zinc-950">
                    {issue.count}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
