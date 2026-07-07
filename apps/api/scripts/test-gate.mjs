#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const MAX_DURATION_MS = Number(process.env.API_TEST_MAX_MS ?? '90000')
const reportDir = join(process.cwd(), '.tmp')
const reportPath = join(reportDir, 'vitest-report.json')

rmSync(reportPath, { force: true })
mkdirSync(reportDir, { recursive: true })

const run = spawnSync(
  'npx',
  [
    'vitest',
    'run',
    '--fileParallelism=false',
    '--retry=2',
    '--reporter=json',
    '--outputFile',
    reportPath,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
    },
  },
)

let report
try {
  report = JSON.parse(readFileSync(reportPath, 'utf8'))
} catch {
  console.error('Test gate: failed to parse vitest JSON report.')
  process.exit(run.status ?? 1)
}

const durationMs = Number(report.duration ?? 0)
const failedTests = Number(report.numFailedTests ?? 0)

if (failedTests > 0) {
  console.error(`Test gate: failed tests detected (${failedTests}).`)
  process.exit(1)
}

if (durationMs > MAX_DURATION_MS) {
  console.error(
    `Test gate: duration ${durationMs}ms exceeds budget ${MAX_DURATION_MS}ms.`,
  )
  process.exit(1)
}

console.log(
  `Test gate passed: duration=${durationMs}ms, failedTests=${failedTests}, budget=${MAX_DURATION_MS}ms.`,
)
