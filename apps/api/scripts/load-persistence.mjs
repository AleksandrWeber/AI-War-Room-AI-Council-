#!/usr/bin/env node
/**
 * Opt-in load probe for Redis stream throughput, concurrent run pressure,
 * stream lag/backlog signals, and PostgreSQL write pressure.
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
const concurrentRuns = Number(process.env.LOAD_CONCURRENT_RUNS ?? 12)
const appendsPerRun = Number(process.env.LOAD_APPENDS_PER_RUN ?? 40)
const pgInserts = Number(process.env.LOAD_PG_INSERTS ?? 1_000)
const redisBudgetMs = Number(process.env.LOAD_REDIS_BUDGET_MS ?? 8_000)
const concurrentBudgetMs = Number(process.env.LOAD_CONCURRENT_BUDGET_MS ?? 10_000)
const pgBudgetMs = Number(process.env.LOAD_PG_BUDGET_MS ?? 5_000)
const lagBudgetMs = Number(process.env.LOAD_LAG_BUDGET_MS ?? 2_000)

async function xaddStatus(redis, streamKey, eventId) {
  await redis.sendCommand([
    'XADD',
    streamKey,
    'MAXLEN',
    '~',
    String(STREAM_BUFFER_MAX_LENGTH),
    '*',
    'event',
    JSON.stringify({
      eventId,
      type: 'status',
      stepId: 'load_test',
      label: 'Load test',
      status: 'running',
      timestamp: new Date().toISOString(),
    }),
  ])
}

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
            await xaddStatus(redis, streamKey, `local_${workerIndex}_${i}`)
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

async function runConcurrentRunStreamsAndLag() {
  const redis = createClient({ url: redisUrl })
  await redis.connect()

  const workspaceId = `load_workspace_concurrent_${Date.now()}`
  const streamKeys = Array.from(
    { length: concurrentRuns },
    (_, index) => `pipeline-stream:${workspaceId}:run_${index}`,
  )
  const startedAt = performance.now()

  try {
    await Promise.all(
      streamKeys.map((streamKey, runIndex) =>
        (async () => {
          for (let i = 0; i < appendsPerRun; i += 1) {
            await xaddStatus(redis, streamKey, `run_${runIndex}_${i}`)
          }
        })(),
      ),
    )

    const elapsedMs = performance.now() - startedAt
    const totalAppends = concurrentRuns * appendsPerRun
    const lengths = await Promise.all(
      streamKeys.map(async (key) => Number(await redis.sendCommand(['XLEN', key]))),
    )
    const maxLength = Math.max(...lengths)
    const lastEntries = await Promise.all(
      streamKeys.map(async (key) => {
        const result = await redis.sendCommand([
          'XREVRANGE',
          key,
          '+',
          '-',
          'COUNT',
          '1',
        ])
        return result
      }),
    )

    let maxLagMs = 0
    for (const entry of lastEntries) {
      if (!Array.isArray(entry) || entry.length === 0) {
        continue
      }
      const fields = entry[0]?.[1]
      if (!Array.isArray(fields)) {
        continue
      }
      const eventIndex = fields.findIndex((field) => field === 'event')
      if (eventIndex < 0) {
        continue
      }
      try {
        const payload = JSON.parse(String(fields[eventIndex + 1]))
        const lagMs = Date.now() - Date.parse(payload.timestamp)
        if (Number.isFinite(lagMs)) {
          maxLagMs = Math.max(maxLagMs, lagMs)
        }
      } catch {
        // ignore malformed probe payloads
      }
    }

    console.log(
      `Concurrent runs: ${concurrentRuns} streams × ${appendsPerRun} appends = ${totalAppends} in ${elapsedMs.toFixed(0)}ms; maxXLEN=${maxLength}; maxEventLag=${maxLagMs.toFixed(0)}ms`,
    )

    if (elapsedMs > concurrentBudgetMs) {
      throw new Error(
        `Concurrent stream load exceeded budget: ${elapsedMs.toFixed(0)}ms > ${concurrentBudgetMs}ms`,
      )
    }

    if (maxLagMs > lagBudgetMs) {
      throw new Error(
        `Stream lag after concurrent load exceeded budget: ${maxLagMs.toFixed(0)}ms > ${lagBudgetMs}ms`,
      )
    }

    if (maxLength > STREAM_BUFFER_MAX_LENGTH * 2) {
      throw new Error(
        `Concurrent stream trim unexpectedly weak: max retained ${maxLength}`,
      )
    }
  } finally {
    if (streamKeys.length > 0) {
      await redis.del(streamKeys)
    }
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
  await runConcurrentRunStreamsAndLag()
  await runPostgresWriteLoad()
  console.log('Persistence load tests passed.')
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
