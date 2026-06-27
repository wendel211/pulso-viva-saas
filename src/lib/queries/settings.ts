import "server-only";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { verifySession } from "@/lib/dal";
import {
  DEFAULT_RANKING_WEIGHTS,
  type RankingWeights,
} from "@/lib/ranking/engine";
import {
  DEFAULT_SEGMENT,
  DEFAULT_SLOT_VALUE_CENTS,
  type Segment,
} from "@/lib/segment";

export type OrgProfile = {
  segment: Segment;
  slotValueCents: number;
};

/** Perfil da organização (segmento + valor da vaga), com defaults. */
export async function getOrgProfile(): Promise<OrgProfile> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  const s = rows[0]?.settings;
  return {
    segment: s?.segment ?? DEFAULT_SEGMENT,
    slotValueCents: s?.slotValueCents ?? DEFAULT_SLOT_VALUE_CENTS,
  };
}

/** Pesos do ranking da organização, com fallback para os padrões (RF17). */
export async function getRankingWeights(): Promise<RankingWeights> {
  const { organizationId } = await verifySession();

  const rows = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  const stored = rows[0]?.settings?.rankingWeights;
  return stored ?? DEFAULT_RANKING_WEIGHTS;
}
