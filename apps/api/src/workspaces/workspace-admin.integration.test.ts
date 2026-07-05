import request from 'supertest'
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

describe('llm integration', () => {

  it('reports llm capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/llm/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLlmRollout: true,
      primaryProvider: 'mock',
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/llm/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })
})

describe('research integration', () => {

  it('reports research capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/research/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResearchRollout: true,
      researchProvider: 'mock',
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/research/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })
})

describe('workspace admin integration', () => {

  it('returns workspace member admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/members')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        memberCount: expect.any(Number),
      },
    })
  })

  it('rejects workspace member admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/members')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('exports workspace audit data for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/audit/export?format=json')
      .set(authHeaders)
      .expect(200)

    expect(response.headers['content-type']).toContain('application/json')
    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      stats: {
        usageEventCount: expect.any(Number),
      },
    })
  })

  it('rejects workspace audit export for members', async () => {
    await request(app.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/audit/export?format=csv')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('returns workspace settings admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/settings')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      settings: {
        name: expect.any(String),
      },
    })
  })

  it('rejects workspace settings admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/settings')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
