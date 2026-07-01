import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/server/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE to your environment.",
  );
}

const globalForDb = globalThis as unknown as {
  postgresClient?: postgres.Sql;
};

const client =
  globalForDb.postgresClient ??
  postgres(databaseUrl, {
    max: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
export { client as sql };
