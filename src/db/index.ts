import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

// Reutiliza a conexão entre hot-reloads em desenvolvimento.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  drizzleDb?: DbClient;
};

function createDb(): DbClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida. Veja .env.example.");
  }

  const client = globalForDb.pgClient ?? postgres(connectionString, { max: 10 });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.pgClient = client;
  }

  return drizzle(client, { schema });
}

/**
 * Cliente do banco com inicialização preguiçosa: a conexão só é criada (e a
 * variável DATABASE_URL só é exigida) no primeiro acesso em runtime. Assim o
 * `next build` consegue coletar as páginas sem precisar de banco.
 */
export const db = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    const instance = globalForDb.drizzleDb ?? (globalForDb.drizzleDb = createDb());
    return Reflect.get(instance, prop, receiver);
  },
});

export { schema };
