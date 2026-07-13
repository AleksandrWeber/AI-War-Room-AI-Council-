#!/usr/bin/env node
/**
 * Opt-in load probe for Redis stream throughput and PostgreSQL write pressure.
 *
 * Usage:
 *   RUN_LOAD_TESTS=1 npm run test:load --workspace @ai-war-room/api
 *
 * Requires REDIS_URL and DATABASE_URL (same as local infra).
 * Skips cleanly when RUN_LOAD_TESTS is unset so quality:gate stays untouched.
 */
import { performance } from 'node:perf_hooks'
import { createClient } from 'redis'
import { Pool } from 'pg'

const STREAM_BUFFER_MAX_LENGTH = 100
const runLoadTests = process.env.RUN_LOAD_TESTS === '1'

if (!runLoadTests) {
  console.log(
    'Skipping persistence load tests. Set RUN_LOAD_TESTS=1 to enable.',
  )
  process.exit(0)
}

const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379'
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room'
const workers = Number(process.env.LOAD_WORKERS ?? 8)
const appendsPerWorker = Number(process.env.LOAD_APPENDS_PER_WORKER ?? 200)
const pgInserts = Number(process.env.LOAD_PG_INSERTS ?? 1_000)
const redisBudgetMs = Number(process.env.LOAD_REDIS_BUDGET_MS ?? 8_000)
const pgBudgetMs = Number(process.env.LOAD_PG_BUDGET_MS ?? 5_000)

async function runRedisStreamLoad() {
  const redis = createClient({ url: redisUrl })
  await redis.connect()

  const workspaceId = `load_workspace_${Date.now()}`
  const runId = `load_run_${Date.now()}`
  const streamKey = `pipeline-stream:${workspaceId}:${runId}`
  const totalAppends = workers * appendsPerWorker
  const startedAt = performance.now()

  try {
    await Promise.all(
      Array.from({ length: workers }, (_, workerIndex) =>
        (async () => {
          for (let i = 0; i < appendsPerWorker; i += 1) {
            await redis.sendCommand([
              'XADD',
              streamKey,
              'MAXLEN',
              '~',
              String(STREAM_BUFFER_MAX_LENGTH),
              '*',
              'event',
              JSON.stringify({
                eventId: `local_${workerIndex}_${i}`,
                type: 'status',
                stepId: 'load_test',
                label: 'Load test',
                status: 'running',
                timestamp: new Date().toISOString(),
              }),
            ])
          }
        })(),
      ),
    )

    const elapsedMs = performance.now() - startedAt
    const opsPerSecond = Math.round((totalAppends / elapsedMs) * 1000)
    const streamLength = Number(await redis.sendCommand(['XLEN', streamKey]))

    console.log(
      `Redis stream: ${totalAppends} appends in ${elapsedMs.toFixed(0)}ms (${opsPerSecond} ops/s), retained=${streamLength} (MAXLEN~${STREAM_BUFFER_MAX_LENGTH})`,
    )

    if (elapsedMs > redisBudgetMs) {
      throw new Error(
        `Redis stream load exceeded budget: ${elapsedMs.toFixed(0)}ms > ${redisBudgetMs}ms`,
      )
    }

    if (streamLength > STREAM_BUFFER_MAX_LENGTH * 2) {
      throw new Error(
        `Redis stream trim unexpectedly weak: retained ${streamLength} events`,
      )
    }
  } finally {
    await redis.del(streamKey)
    await redis.quit()
  }
}

async function runPostgresWriteLoad() {
  const pool = new Pool({ connectionString: databaseUrl })
  const startedAt = performance.now()

  try {
    await pool.query('SELECT 1')
    await pool.query(`
      CREATE TEMP TABLE load_write_pressure (
        id BIGSERIAL PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    for (let i = 0; i < pgInserts; i += 1) {
      await pool.query(
        `INSERT INTO load_write_pressure (payload) VALUES ($1::jsonb)`,
        [JSON.stringify({ i, source: 'load-persistence' })],
      )
    }

    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM load_write_pressure',
    )
    const elapsedMs = performance.now() - startedAt
    const opsPerSecond = Math.round((pgInserts / elapsedMs) * 1000)

    console.log(
      `PostgreSQL writes: ${pgInserts} inserts in ${elapsedMs.toFixed(0)}ms (${opsPerSecond} ops/s), rows=${countResult.rows[0].count}`,
    )

    if (elapsedMs > pgBudgetMs) {
      throw new Error(
        `PostgreSQL write load exceeded budget: ${elapsedMs.toFixed(0)}ms > ${pgBudgetMs}ms`,
      )
    }
  } finally {
    await pool.end()
  }
}

async function main() {
  await runRedisStreamLoad()
  await runPostgresWriteLoad()
  console.log('Persistence load tests passed.')
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
