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
