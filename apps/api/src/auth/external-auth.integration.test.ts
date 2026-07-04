import { Test } from '@nestjs/testing'
import type { TestingModule } from '@nestjs/testing'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createMockExternalAuthToken } from './external-auth.adapter.js'

vi.hoisted(() => {
  process.env.AUTH_PROVIDER = 'external'
  process.env.AUTH_EXTERNAL_ADAPTER = 'mock'
  process.env.AUTH_EXTERNAL_VENDOR = 'clerk'
  process.env.AUTH_EXTERNAL_JWT_SECRET = 'external-integration-secret'
  process.env.AUTH_EXTERNAL_ISSUER = 'ai-war-room-external-auth'
  process.env.AUTH_EXTERNAL_AUDIENCE = 'ai-war-room-api'
  process.env.AUTH_EXTERNAL_AUTO_PROVISION = 'true'
})

describe('external auth integration', () => {
  let app: NestFastifyApplication | undefined
  let moduleRef: TestingModule | undefined
  let externalToken = ''

  beforeAll(async () => {
    externalToken = await createMockExternalAuthToken({
      secret: 'external-integration-secret',
      vendor: 'clerk',
      subject: 'user_external',
      workspaceId: 'workspace_external_new',
      issuer: 'ai-war-room-external-auth',
      audience: 'ai-war-room-api',
    })

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
    delete process.env.AUTH_PROVIDER
    delete process.env.AUTH_EXTERNAL_ADAPTER
    delete process.env.AUTH_EXTERNAL_VENDOR
    delete process.env.AUTH_EXTERNAL_JWT_SECRET
    delete process.env.AUTH_EXTERNAL_ISSUER
    delete process.env.AUTH_EXTERNAL_AUDIENCE
    await app?.close()
  })

  it('reports external auth capabilities', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/auth/capabilities')
      .expect(200)

    expect(response.body).toMatchObject({
      provider: 'external',
      externalVendor: 'clerk',
      externalAdapter: 'mock',
      supportsSessionBootstrap: false,
      supportsExternalProvisioning: true,
      workspaceHeadersRequired: false,
    })
  })

  it('accepts protected requests with external provider tokens', async () => {
    const response = await request(app!.getHttpServer())
      .post('/api/runs/draft')
      .set({
        authorization: `Bearer ${externalToken}`,
      })
      .send({
        workspaceId: 'workspace_external_new',
        idempotencyKey: 'idem_external_auth',
        idea: {
          rawIdea: 'Build with external auth provider tokens.',
        },
      })
      .expect(201)

    expect(response.body.workspaceId).toBe('workspace_external_new')
  })

  it('provisions external users through the auth provision endpoint', async () => {
    const token = await createMockExternalAuthToken({
      secret: 'external-integration-secret',
      vendor: 'clerk',
      subject: 'user_provision',
      workspaceId: 'workspace_provision_api',
      issuer: 'ai-war-room-external-auth',
      audience: 'ai-war-room-api',
    })

    const response = await request(app!.getHttpServer())
      .post('/api/auth/provision')
      .set({
        authorization: `Bearer ${token}`,
      })
      .send({
        workspaceId: 'workspace_provision_api',
      })
      .expect(201)

    expect(response.body).toMatchObject({
      userId: 'clerk_user_provision',
      workspaceId: 'workspace_provision_api',
      role: 'owner',
      actions: expect.arrayContaining(['created_user', 'created_membership']),
    })
  })
})
