import { Test } from '@nestjs/testing'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AppModule } from './app.module.js'

describe('API skeleton', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
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
    await app.close()
  })

  it('returns health status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)

    expect(response.body).toEqual({
      service: 'ai-war-room-api',
      status: 'ok',
      version: '0.0.0',
    })
  })

  it('returns version metadata', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/version')
      .expect(200)

    expect(response.body).toEqual({
      name: 'AI War Room API',
      version: '0.0.0',
    })
  })

  it('returns run capabilities from shared schemas', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/runs/capabilities')
      .expect(200)

    expect(response.body.statuses).toContain('draft')
    expect(response.body.agentRoles).toContain('product_manager')
    expect(response.body.flow).toContain('human_review')
  })
})
