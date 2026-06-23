import "server-only";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/dal";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const MANAGE_ROLES = ["org_manager", "admin_pulsoviva"];

export async function canManageTeam(): Promise<boolean> {
  const session = await verifySession();
  return MANAGE_ROLES.includes(session.role);
}

/** Lista os usuários da organização (RF12). */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const session = await verifySession();

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.organizationId, session.organizationId))
    .orderBy(users.name);
}
