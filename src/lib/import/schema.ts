import * as z from "zod";

/**
 * Modelo de planilha padrão do Hub de Acesso (doc §13).
 * Cada chave canônica abaixo aceita variações de cabeçalho (acentos, caixa,
 * sinônimos) para reduzir a barreira de implantação (importação inteligente).
 */
export const COLUMN_ALIASES: Record<string, string[]> = {
  externalId: ["external_id", "id externo", "id_externo", "matricula", "prontuario"],
  patientName: ["paciente", "nome", "nome_paciente", "nome do paciente"],
  contact: ["contato", "telefone", "celular", "fone"],
  age: ["idade"],
  specialty: ["especialidade"],
  procedure: ["procedimento", "exame"],
  requestedAt: ["data_solicitacao", "data solicitacao", "data da solicitacao"],
  priority: ["prioridade"],
  unit: ["unidade", "local"],
  scheduledAt: ["data_agendamento", "data agendamento", "data_hora", "data hora"],
  professional: ["profissional", "medico", "médico"],
  status: ["status", "situacao", "situação"],
};

/** Status de agenda aceitos na planilha → enum interno. */
export const STATUS_MAP: Record<string, string> = {
  agendado: "scheduled",
  confirmado: "confirmed",
  reagendado: "rescheduled",
  compareceu: "attended",
  faltou: "no_show",
  cancelado: "cancelled",
};

/** Schema de validação de uma linha (RF04). */
export const ImportRowSchema = z.object({
  externalId: z.string().trim().optional(),
  patientName: z.string().trim().min(1, "Nome do paciente é obrigatório.").optional(),
  contact: z.string().trim().optional(),
  age: z.coerce.number().int().min(0).max(130).optional(),
  specialty: z.string().trim().optional(),
  procedure: z.string().trim().optional(),
  requestedAt: z.coerce.date().optional(),
  priority: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  scheduledAt: z.coerce.date().optional(),
  professional: z.string().trim().optional(),
  status: z.string().trim().optional(),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

export type RowError = { row: number; field: string; message: string };

/** Normaliza um cabeçalho bruto para a chave canônica (ou null). */
export function canonicalizeHeader(raw: string): string | null {
  const norm = raw
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (key.toLowerCase() === norm) return key;
    if (
      aliases.some(
        (a) => a.normalize("NFD").replace(/[̀-ͯ]/g, "") === norm,
      )
    ) {
      return key;
    }
  }
  return null;
}
