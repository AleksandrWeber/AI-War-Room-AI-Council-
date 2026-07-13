#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const apiPort = process.env.API_PORT ?? '3017'
const webOrigin = process.env.WEB_ORIGIN ?? 'http://127.0.0.1:5177'

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

run('npm', ['run', 'infra:up', '--', 'postgres', 'redis'])
run('npm', ['run', 'db:migrate'], {
  ...process.env,
  API_PORT: apiPort,
  WEB_ORIGIN: webOrigin,
})

const api = spawn('npm', ['run', 'dev', '--workspace', 'apps/api'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    API_PORT: apiPort,
    WEB_ORIGIN: webOrigin,
  },
})

function shutdown(signal) {
  api.kill(signal)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

api.on('exit', (code, signal) => {
  if (signal) {
    process.exit(0)
  }

  process.exit(code ?? 0)
})
