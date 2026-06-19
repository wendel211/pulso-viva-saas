import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Seed de desenvolvimento: cria uma organização e um usuário gestor
 * para validar o fluxo de login.
 *
 *   Email: gestor@pulsoviva.com.br
 *   Senha: PulsoViva@2026
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  const [org] = await db
    .insert(schema.organizations)
    .values({
      name: "Clínica Demonstração",
      type: "clínica",
      status: "trial",
    })
    .returning();

  const passwordHash = await bcrypt.hash("PulsoViva@2026", 10);

  await db.insert(schema.users).values({
    organizationId: org.id,
    name: "Gestor Demo",
    email: "gestor@pulsoviva.com.br",
    passwordHash,
    role: "org_manager",
  });

  console.log("Seed concluído. Login: gestor@pulsoviva.com.br / PulsoViva@2026");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
