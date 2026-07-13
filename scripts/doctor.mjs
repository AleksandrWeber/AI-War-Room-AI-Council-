#!/usr/bin/env node
/**
 * Local environment doctor for AI War Room contributors.
 * Exit 0 when required checks pass; exit 1 when something blocks day-1 setup.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createConnection } from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const warnings = []

function ok(label, detail = '') {
  console.log(`  pass  ${label}${detail ? ` — ${detail}` : ''}`)
}

function fail(label, detail) {
  failures.push(`${label}: ${detail}`)
  console.log(`  fail  ${label} — ${detail}`)
}

function warn(label, detail) {
  warnings.push(`${label}: ${detail}`)
  console.log(`  warn  ${label} — ${detail}`)
}

function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {}
  }

  const values = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const eq = trimmed.indexOf('=')
    if (eq <= 0) {
      continue
    }
    values[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return values
}

function canConnect(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port })
    const done = (result) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(result)
    }
    socket.setTimeout(timeoutMs)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })
}

function parseHostPort(urlLike, fallbackHost, fallbackPort) {
  try {
    const url = new URL(urlLike)
    return {
      host: url.hostname || fallbackHost,
      port: Number(url.port || fallbackPort),
    }
  } catch {
    return { host: fallbackHost, port: fallbackPort }
  }
}

console.log('AI War Room doctor\n')

const major = Number(process.versions.node.split('.')[0])
if (major >= 22) {
  ok('Node.js', process.versions.node)
} else {
  fail('Node.js', `found ${process.versions.node}; need 22+`)
}

const envExample = join(root, '.env.example')
const envLocal = join(root, '.env')
if (existsSync(envExample)) {
  ok('.env.example', 'present')
} else {
  fail('.env.example', 'missing from repo root')
}

if (existsSync(envLocal)) {
  ok('.env', 'present')
} else {
  fail('.env', 'missing — run: cp .env.example .env')
}

const env = {
  ...parseEnvFile(envExample),
  ...parseEnvFile(envLocal),
  ...process.env,
}

const databaseUrl =
  env.DATABASE_URL ?? 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room'
const redisUrl = env.REDIS_URL ?? 'redis://127.0.0.1:6379'
const apiPort = Number(env.API_PORT ?? 3000)

const pg = parseHostPort(databaseUrl.replace(/^postgres(ql)?:\/\//, 'http://'), '127.0.0.1', 5432)
if (await canConnect(pg.host, pg.port)) {
  ok('PostgreSQL', `${pg.host}:${pg.port}`)
} else {
  fail('PostgreSQL', `cannot connect to ${pg.host}:${pg.port} — run: npm run infra:up`)
}

const redis = parseHostPort(redisUrl, '127.0.0.1', 6379)
if (await canConnect(redis.host, redis.port)) {
  ok('Redis', `${redis.host}:${redis.port}`)
} else {
  fail('Redis', `cannot connect to ${redis.host}:${redis.port} — run: npm run infra:up`)
}

if (await canConnect('127.0.0.1', apiPort)) {
  ok('API port', `127.0.0.1:${apiPort} is listening`)
} else {
  warn('API port', `nothing on 127.0.0.1:${apiPort} — start with: npm run dev:api`)
}

if ((env.LLM_PRIMARY_PROVIDER ?? 'mock') === 'mock') {
  ok('LLM mode', 'mock (safe for day-1)')
} else {
  warn(
    'LLM mode',
    `${env.LLM_PRIMARY_PROVIDER} — real providers need keys; mock is recommended for first run`,
  )
}

if ((env.TEMPORAL_ENABLED ?? 'false') === 'true') {
  warn('Temporal', 'enabled — ensure server + worker are running')
} else {
  ok('Temporal', 'disabled (default local path)')
}

console.log('')
if (failures.length) {
  console.log(`Doctor found ${failures.length} blocking issue(s).`)
  console.log('See docs/ONBOARDING.md for the day-1 path.\n')
  process.exit(1)
}

console.log('Required checks passed.')
if (warnings.length) {
  console.log(`${warnings.length} warning(s) — usually fine for first setup.`)
}
console.log('Next: docs/ONBOARDING.md\n')
process.exit(0)
