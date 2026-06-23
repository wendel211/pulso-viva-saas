"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { organizations, auditLogs } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type SettingsState = { ok?: boolean; message?: string } | undefined;

/**
 * Atualiza os pesos do ranking de encaixe (RF17), com limites seguros:
 * cada peso entre 0 e 1, normalizado para somar 1 (evita pesos degenerados).
 */
export async function updateRankingWeights(
  _state: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await verifySession();
  if (!["org_manager", "admin_pulsoviva"].includes(session.role)) {
    return { ok: false, message: "Apenas gestores podem ajustar os pesos." };
  }

  const parse = (name: string) => {
    const raw = Number(formData.get(name));
    if (Number.isNaN(raw) || raw < 0 || raw > 100) return null;
    return raw;
  };

  const waitTime = parse("waitTime");
  const priority = parse("priority");
  const reliability = parse("reliability");
  const contact = parse("contact");

  if (
    waitTime === null ||
    priority === null ||
    reliability === null ||
    contact === null
  ) {
    return { ok: false, message: "Use valores entre 0 e 100 para cada peso." };
  }

  const total = waitTime + priority + reliability + contact;
  if (total === 0) {
    return { ok: false, message: "A soma dos pesos não pode ser zero." };
  }

  // Normaliza para frações que somam 1.
  const normalized = {
    waitTime: waitTime / total,
    priority: priority / total,
    reliability: reliability / total,
    contact: contact / total,
  };

  const orgId = session.organizationId;

  // Preserva outros campos de settings já existentes.
  const existing = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  await db
    .update(organizations)
    .set({
      settings: {
        ...(existing[0]?.settings ?? {}),
        rankingWeights: normalized,
      },
    })
    .where(eq(organizations.id, orgId));

  await db.insert(auditLogs).values({
    organizationId: orgId,
    userId: session.userId,
    action: "update_settings",
    resource: "ranking_weights",
    metadata: normalized,
  });

  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/encaixe");

  return { ok: true, message: "Pesos atualizados com sucesso." };
}
