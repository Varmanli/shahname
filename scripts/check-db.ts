import "dotenv/config";

import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const connectionString = databaseUrl;

async function main() {
  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
  });

  try {
    const [connection] = await sql<{
      database: string;
      user: string;
      host: string;
      port: number;
    }[]>`
      select
        current_database() as database,
        current_user as user,
        inet_server_addr()::text as host,
        inet_server_port() as port
    `;

    console.log(
      `Connected to ${connection.database} as ${connection.user} on ${connection.host}:${connection.port}.`,
    );

    const tables = await sql<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `;

    console.log(
      tables.length
        ? `Tables: ${tables.map((table) => table.table_name).join(", ")}`
        : "No public tables found. Run npm run db:migrate.",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    console.error(`Database check failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
