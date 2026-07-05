#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const sourcePath = join(
  root,
  'apps/api/src/workspaces/workspace-admin.integration.test.ts',
)
const corePath = join(
  root,
  'apps/api/src/workspaces/workspace-admin.integration.test.ts',
)
const rolloutPath = join(
  root,
  'apps/api/src/workspaces/workspace-admin-rollout.integration.test.ts',
)

const BOOTSTRAP_RE =
  /\n  let app: NestFastifyApplication \| undefined\n\n  beforeAll\(async \(\) => \{\n    const \{ AppModule \} = await import\('\.\.\/app\.module\.js'\)\n\n    const moduleRef: TestingModule = await Test\.createTestingModule\(\{\n      imports: \[AppModule\],\n    \}\)\.compile\(\)\n\n    app = moduleRef\.createNestApplication<NestFastifyApplication>\(\n      new FastifyAdapter\(\),\n    \)\n    app\.setGlobalPrefix\('api'\)\n    await app\.init\(\)\n    await app\.getHttpAdapter\(\)\.getInstance\(\)\.ready\(\)\n  \}\)\n\n  afterAll\(async \(\) => \{\n    await app\?\.close\(\)\n  \}\)\n/g

const CORE_HEADER = `import request from 'supertest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  closeIntegrationApp,
  getIntegrationApp,
} from '../test/integration-app.js'

const authHeaders = {
  'x-user-id': 'user_test',
  'x-workspace-id': 'workspace_1',
}

let app: NestFastifyApplication

beforeAll(async () => {
  app = await getIntegrationApp()
})

afterAll(async () => {
  await closeIntegrationApp()
})

`

const ROLLOUT_HEADER = `import request from 'supertest'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  closeIntegrationApp,
  getIntegrationApp,
} from '../test/integration-app.js'

const authHeaders = {
  'x-user-id': 'user_test',
  'x-workspace-id': 'workspace_1',
}

let app: NestFastifyApplication

beforeAll(async () => {
  app = await getIntegrationApp()
})

afterAll(async () => {
  await closeIntegrationApp()
})

`

const source = readFileSync(sourcePath, 'utf8')
const rolloutStart = source.indexOf("describe('temporal rollout integration'")
if (rolloutStart < 0) {
  throw new Error('Could not find rollout section start')
}

const coreSection = source.slice(0, rolloutStart).replace(
  /^import { Test } from '@nestjs\/testing'\nimport type { TestingModule } from '@nestjs\/testing'\nimport \{\n  FastifyAdapter,\n  type NestFastifyApplication,\n} from '@nestjs\/platform-fastify'\nimport request from 'supertest'\nimport { afterAll, beforeAll, describe, expect, it } from 'vitest'\n\nconst authHeaders = \{\n  'x-user-id': 'user_test',\n  'x-workspace-id': 'workspace_1',\n\}\n\n/m,
  '',
)
const rolloutSection = source.slice(rolloutStart)

const stripBootstrap = (text) =>
  text.replace(BOOTSTRAP_RE, '\n').replaceAll('app!.getHttpServer()', 'app.getHttpServer()')

const coreBody = stripBootstrap(coreSection).trimEnd()
const rolloutBody = stripBootstrap(rolloutSection).trimEnd()

writeFileSync(corePath, `${CORE_HEADER}${coreBody}\n`)
writeFileSync(rolloutPath, `${ROLLOUT_HEADER}${rolloutBody}\n`)

const bootstrapCount = (source.match(BOOTSTRAP_RE) ?? []).length
console.log(
  `Refactored integration tests: removed ${bootstrapCount} duplicate bootstraps; rollout → workspace-admin-rollout.integration.test.ts`,
)
