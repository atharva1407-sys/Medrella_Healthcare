import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import path from "path";
import { sql } from "drizzle-orm";

const MIGRATION_LOCK_KEY = "medrella_db_migration_lock";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString || !connectionString.startsWith("postgres")) {
    console.error("❌ [MIGRATE_ERROR]: DATABASE_URL is not configured or not a PostgreSQL connection string.");
    process.exit(1);
  }

  // Sanitize log: log only hostname, never user or password
  try {
    const parsed = new URL(connectionString);
    console.log(`🔒 [MIGRATE]: Connecting to PostgreSQL host: ${parsed.hostname}`);
  } catch {
    console.log("🔒 [MIGRATE]: Connecting to PostgreSQL database...");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  const db = drizzle(client);

  let lockAcquired = false;

  try {
    console.log("🔒 [MIGRATE]: Acquiring deployment advisory lock on dedicated connection...");
    await client.query("SELECT pg_advisory_lock(hashtext($1))", [MIGRATION_LOCK_KEY]);
    lockAcquired = true;
    console.log("✅ [MIGRATE]: Advisory lock acquired on dedicated connection.");

    const migrationsFolder = path.resolve(process.cwd(), "src/db/migrations");
    console.log(`🚀 [MIGRATE]: Applying version-controlled migrations from: ${migrationsFolder}`);

    await migrate(db, { migrationsFolder });

    console.log("🎉 [MIGRATE]: All database migrations applied and verified successfully!");
  } catch (err: any) {
    console.error("❌ [MIGRATE_FAILED]: Migration execution failed:", err?.message || err);
    process.exit(1);
  } finally {
    if (lockAcquired) {
      try {
        await client.query("SELECT pg_advisory_unlock(hashtext($1))", [MIGRATION_LOCK_KEY]);
        console.log("🔓 [MIGRATE]: Advisory lock released.");
      } catch (unlockErr: any) {
        console.warn("⚠️ [MIGRATE_WARN]: Failed to release advisory lock:", unlockErr?.message);
      }
    }
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
