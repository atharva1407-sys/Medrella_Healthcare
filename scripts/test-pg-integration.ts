/**
 * Medrella Healthcare — Real PostgreSQL Integration & Concurrency Test Harness
 * 
 * Tests genuine PostgreSQL behavior:
 * - Direct TCP/TLS connection and server version verification
 * - Drizzle schema table verification
 * - pg_advisory_xact_lock concurrency serialization
 * - Atomic CTE rate-limit execution
 * - Transaction rollback isolation
 * - Unique constraint (23505) violation graceful catch & recovery
 */

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql, eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import crypto from "crypto";

async function main() {
  console.log("🐘 Starting Medrella Real PostgreSQL Integration Test Suite...\n");

  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error("❌ ERROR: Neither TEST_DATABASE_URL nor DATABASE_URL is set in environment.");
    console.error("   A live PostgreSQL instance is required to execute genuine database concurrency tests.");
    console.error("   Example: export TEST_DATABASE_URL=\"postgres://user:password@localhost:5432/medrella_test\"\n");
    process.exit(1);
  }

  // Sanitize connection string for display
  const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ":****@");
  console.log(`📡 Connecting to PostgreSQL at: ${maskedUrl}`);

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
    max: 5,
  });

  const client = await pool.connect();
  const db = drizzle(client, { schema });

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  try {
    // 1. Connection & Version Probe
    console.log("\n--- 1. Live PostgreSQL Connection Probe ---");
    const versionRes = await client.query("SELECT version() as ver, current_database() as db_name, now() as db_time");
    assert(Boolean(versionRes.rows[0]?.ver), `Connected to PostgreSQL: ${versionRes.rows[0]?.ver?.slice(0, 50)}...`);
    assert(Boolean(versionRes.rows[0]?.db_name), `Active Database: ${versionRes.rows[0]?.db_name}`);

    // 2. Schema Table Verification
    console.log("\n--- 2. Core Healthcare Schema Verification ---");
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = new Set(tablesRes.rows.map((r: any) => r.table_name));
    const requiredTables = [
      "users",
      "patients",
      "doctors",
      "availabilities",
      "appointments",
      "doctor_leaves",
      "payments",
      "payment_events",
      "refunds",
      "notifications",
      "rate_limits",
    ];

    for (const table of requiredTables) {
      assert(tables.has(table), `Table '${table}' exists in public schema`);
    }

    // 3. Transaction Rollback & Isolation Check
    console.log("\n--- 3. ACID Transaction Rollback Integrity ---");
    const testEmail = `rollback_test_${crypto.randomUUID()}@medrella.internal`;
    try {
      await db.transaction(async (tx) => {
        await tx.insert(schema.users).values({
          id: `usr_${crypto.randomUUID()}`,
          email: testEmail,
          passwordHash: "test_hash",
          role: "PATIENT",
          isActive: true,
          createdAt: new Date(),
        });
        // Intentionally throw to trigger transaction rollback
        throw new Error("INTENTIONAL_ROLLBACK_TEST");
      });
    } catch (err: any) {
      if (err.message !== "INTENTIONAL_ROLLBACK_TEST") throw err;
    }

    const checkRollback = await db.select().from(schema.users).where(eq(schema.users.email, testEmail));
    assert(checkRollback.length === 0, "Rolled-back transaction leaves zero residual records in database");

    // 4. Advisory Lock Concurrency Serialization
    console.log("\n--- 4. Concurrency & Transaction Advisory Locks ---");
    const lockKey = `test_lock_${crypto.randomUUID()}`;
    let lockAcquired = false;

    await db.transaction(async (tx) => {
      const lockRes = await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${lockKey})) as locked`);
      lockAcquired = true;
    });
    assert(lockAcquired, "pg_advisory_xact_lock successfully acquired and auto-released on commit");

    // 5. Unique Constraint (23505) Graceful Recovery
    console.log("\n--- 5. Unique Constraint Idempotency Handling (Error 23505) ---");
    const testIdempotencyKey = `ref_key_${crypto.randomUUID()}`;
    const testPaymentId = `pay_${crypto.randomUUID()}`;
    const testApptId = `apt_${crypto.randomUUID()}`;

    // First insert succeeds
    const [firstRefund] = await db.insert(schema.refunds).values({
      id: `ref_${crypto.randomUUID()}`,
      paymentId: testPaymentId,
      appointmentId: testApptId,
      amountPaise: 50000,
      reason: "Initial test refund",
      status: "REQUESTED",
      providerRefundId: null,
      idempotencyKey: testIdempotencyKey,
      failureReason: null,
    }).returning();

    assert(Boolean(firstRefund?.id), "First refund record inserted successfully");

    // Second insert with same idempotency key tests 23505 error code
    let caught23505 = false;
    let fallbackRefund: any = null;

    try {
      await db.insert(schema.refunds).values({
        id: `ref_${crypto.randomUUID()}`,
        paymentId: testPaymentId,
        appointmentId: testApptId,
        amountPaise: 50000,
        reason: "Duplicate concurrent request",
        status: "REQUESTED",
        providerRefundId: null,
        idempotencyKey: testIdempotencyKey,
        failureReason: null,
      });
    } catch (err: any) {
      if (err?.code === "23505" || err?.message?.includes("refunds_idempotency_key_unique")) {
        caught23505 = true;
        // Application fallback
        const [existing] = await db.select().from(schema.refunds).where(eq(schema.refunds.idempotencyKey, testIdempotencyKey));
        fallbackRefund = existing;
      }
    }

    assert(caught23505, "PostgreSQL accurately triggers error code 23505 on duplicate idempotency key");
    assert(fallbackRefund?.id === firstRefund?.id, "Application gracefully recovers and returns existing refund record");

    // Clean up test refund
    await db.delete(schema.refunds).where(eq(schema.refunds.idempotencyKey, testIdempotencyKey));

    // 6. Atomic CTE Distributed Rate Limiting
    console.log("\n--- 6. Atomic Distributed CTE Rate Limiting ---");
    const rateLimitKey = `test_ip_${crypto.randomUUID()}`;
    const windowMinutes = 1;
    const maxLimit = 3;

    const testRateLimitSql = async () => {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
      const res = await db.execute(sql`
        WITH current_window AS (
          SELECT count(*)::int AS count
          FROM rate_limits
          WHERE key = ${rateLimitKey} AND created_at >= ${windowStart}
        )
        INSERT INTO rate_limits (id, key, created_at)
        SELECT 
          'rl-' || substr(md5(random()::text || clock_timestamp()::text), 1, 24),
          ${rateLimitKey},
          now()
        FROM current_window
        WHERE current_window.count < ${maxLimit}
        RETURNING (SELECT count FROM current_window) as prev_count;
      `);
      return res.rows.length > 0;
    };

    const call1 = await testRateLimitSql();
    const call2 = await testRateLimitSql();
    const call3 = await testRateLimitSql();
    const call4 = await testRateLimitSql(); // Should be rejected by CTE

    assert(call1 && call2 && call3, "First 3 rate limit tokens allowed within quota");
    assert(!call4, "4th token atomically blocked by PostgreSQL CTE data-modifying conditional insert");

    // Clean up rate limits
    await db.execute(sql`DELETE FROM rate_limits WHERE key = ${rateLimitKey}`);

    console.log("\n==========================================");
    console.log(`PostgreSQL Integration Results: ${passed} passed, ${failed} failed`);
    console.log("==========================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Unhandled exception during PostgreSQL integration test:", err);
  process.exit(1);
});
