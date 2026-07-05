import { Test } from '@nestjs/testing'
import type { TestingModule } from '@nestjs/testing'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const authHeaders = {
  'x-user-id': 'user_test',
  'x-workspace-id': 'workspace_1',
}

describe('usage integration', () => {
  let app: NestFastifyApplication | undefined
  let moduleRef: TestingModule | undefined

  beforeAll(async () => {
    const { AppModule } = await import('../app.module.js')

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    app.setGlobalPrefix('api')
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app?.close()
  })

  it('reports usage capabilities', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/usage/capabilities')
      .expect(200)

    expect(response.body).toMatchObject({
      supportsUsageSummary: true,
      supportsUsageAdminTools: true,
    })
  })

  it('returns usage admin summary for workspace owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/usage/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        dailyEventCount: expect.any(Number),
        distinctRunCount: expect.any(Number),
      },
    })
  })

  it('rejects usage admin tools for workspace members', async () => {
    await request(app!.getHttpServer())
      .get('/api/usage/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('usage limits rollout integration', () => {
  let app: NestFastifyApplication | undefined

  beforeAll(async () => {
    const { AppModule } = await import('../app.module.js')

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    app.setGlobalPrefix('api')
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app?.close()
  })

  it('reports usage limits capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/usage/limits/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUsageLimitsRollout: true,
      supportsQuotaAdminTools: true,
      supportedPaidTiers: ['free', 'pro', 'business'],
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/usage/limits/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns quota admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/usage/limits/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        dailyEventCount: expect.any(Number),
        costUtilizationPercent: expect.any(Number),
      },
    })
  })

  it('rejects quota admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/usage/limits/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
