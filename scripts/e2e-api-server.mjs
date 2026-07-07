#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

run('npm', ['run', 'infra:up', '--', 'postgres', 'redis'])
run('npm', ['run', 'db:migrate'])

const api = spawn('npm', ['run', 'dev', '--workspace', 'apps/api'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
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
