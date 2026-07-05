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

describe('llm integration', () => {
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

  it('reports llm capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/llm/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLlmRollout: true,
      primaryProvider: 'mock',
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/llm/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })
})

describe('research integration', () => {
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

  it('reports research capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/research/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResearchRollout: true,
      researchProvider: 'mock',
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/research/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })
})

describe('workspace admin integration', () => {
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

  it('returns workspace member admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
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
    await request(app!.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/members')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('exports workspace audit data for owners', async () => {
    const response = await request(app!.getHttpServer())
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
    await request(app!.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/audit/export?format=csv')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('returns workspace settings admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
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
    await request(app!.getHttpServer())
      .get('/api/workspaces/workspace_1/admin/settings')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('temporal rollout integration', () => {
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

  it('reports temporal capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/runs/temporal/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTemporalRollout: true,
      temporalEnabled: false,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/runs/temporal/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('disabled')
  })
})

describe('model router rollout integration', () => {
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

  it('reports model router capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/model-router/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsModelRouterRollout: true,
      supportsModelHealthAdminTools: true,
      llmPrimaryProvider: 'mock',
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/model-router/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns model health admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/model-router/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalModels: expect.any(Number),
      },
    })
  })

  it('rejects model health admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/model-router/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('requires auth for legacy model recover endpoint', async () => {
    await request(app!.getHttpServer())
      .post('/api/model-router/registry/mock-json-v1-primary/recover')
      .expect(401)
  })
})

describe('shield rollout integration', () => {
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

  it('reports shield capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/shield/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsShieldRollout: true,
      supportsShieldReviewAdminTools: true,
      classifierId: 'deterministic-shield-fallback/v1',
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/shield/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns shield review admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/shield/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalCases: expect.any(Number),
      },
    })
  })

  it('rejects shield review admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/shield/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('requires auth for legacy shield review summary endpoint', async () => {
    await request(app!.getHttpServer())
      .get('/api/shield/review-summary')
      .expect(401)
  })
})

describe('provider credentials rollout integration', () => {
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

  it('reports provider credentials capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/provider-credentials/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProviderCredentialsRollout: true,
      supportsProviderKeyAdminTools: true,
      managedProviders: ['anthropic', 'openai'],
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/provider-credentials/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns provider key admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/provider-credentials/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalCredentials: expect.any(Number),
      },
    })
  })

  it('rejects provider key admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/provider-credentials/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('observability rollout integration', () => {
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

  it('reports observability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/observability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsObservabilityRollout: true,
      supportsObservabilityAdminTools: true,
      structuredLoggingEnabled: true,
      tracingEnabled: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/observability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns observability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/observability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalEvents: expect.any(Number),
      },
    })
  })

  it('rejects observability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/observability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('prompt evaluation rollout integration', () => {
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

  it('reports prompt evaluation capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/evaluation/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPromptEvaluationRollout: true,
      supportsPromptRegressionAdminTools: true,
      regressionDatasetCaseCount: 6,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/evaluation/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns prompt regression admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/evaluation/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalCases: 6,
      },
    })
  })

  it('rejects prompt regression admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/evaluation/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('run history rollout integration', () => {
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

  it('reports run history capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/runs/history/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRunHistoryRollout: true,
      supportsRunHistoryAdminTools: true,
      supportsMarkdownExport: true,
      supportedArtifactTypes: [
        'executive_summary',
        'prd',
        'development_prompt',
      ],
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/runs/history/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns run history admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/runs/history/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalArtifacts: expect.any(Number),
        uniqueRunCount: expect.any(Number),
      },
    })
  })

  it('rejects run history admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/runs/history/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('stream replay rollout integration', () => {
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

  it('reports stream replay capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/runs/stream/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStreamReplayRollout: true,
      supportsStreamRecoveryAdminTools: true,
      supportsLastEventIdReplay: true,
      streamBufferMaxLength: 100,
      supportedStreamEventTypes: [
        'status',
        'artifact',
        'completed',
        'error',
        'workflow_status',
      ],
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/runs/stream/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stream recovery admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/runs/stream/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        bufferedRunCount: expect.any(Number),
        totalBufferedEvents: expect.any(Number),
      },
    })
  })

  it('rejects stream recovery admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/runs/stream/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('idempotency rollout integration', () => {
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

  it('reports idempotency capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/idempotency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIdempotencyRollout: true,
      supportsIdempotencyAdminTools: true,
      supportsRedisReservations: true,
      defaultReservationTtlSeconds: 86_400,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/idempotency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns idempotency admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/idempotency/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalKeys: expect.any(Number),
        activeReservations: expect.any(Number),
      },
    })
  })

  it('rejects idempotency admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/idempotency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('deployment rollout integration', () => {
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

  it('reports deployment capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/deployment/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeploymentRollout: true,
      supportsDeploymentAdminTools: true,
      supportedDependencies: ['postgres', 'redis'],
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/deployment/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deployment admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/deployment/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDependencies: 2,
        apiVersion: expect.any(String),
      },
    })
  })

  it('rejects deployment admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/deployment/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('migration rollout integration', () => {
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

  it('reports migration capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/migrations/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMigrationRollout: true,
      supportsMigrationAdminTools: true,
      supportsSchemaMigrationsTable: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/migrations/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns migration admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/migrations/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalMigrations: expect.any(Number),
        appliedCount: expect.any(Number),
        pendingCount: expect.any(Number),
      },
    })
  })

  it('rejects migration admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/migrations/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('backup rollout integration', () => {
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

  it('reports backup capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/backup/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBackupRollout: true,
      supportsBackupAdminTools: true,
      supportsPostgresBackupCoverage: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/backup/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns backup admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/backup/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        recoverableDomains: expect.any(Number),
        totalRecords: expect.any(Number),
      },
    })
  })

  it('rejects backup admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/backup/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('audit trail rollout integration', () => {
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

  it('reports audit trail capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/audit/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditTrailRollout: true,
      supportsAuditTrailAdminTools: true,
      supportsWorkspaceAuditExport: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/audit/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns audit admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/audit/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        totalRecords: expect.any(Number),
      },
    })
  })

  it('rejects audit admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/audit/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('compliance rollout integration', () => {
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

  it('reports compliance capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/compliance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComplianceRollout: true,
      supportsComplianceAdminTools: true,
      supportsPolicyTableCoverage: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/compliance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compliance admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/compliance/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        totalRecords: expect.any(Number),
      },
    })
  })

  it('rejects compliance admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/compliance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('incident response rollout integration', () => {
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

  it('reports incident response capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/incidents/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIncidentResponseRollout: true,
      supportsIncidentAdminTools: true,
      supportsBillingAlertEscalation: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/incidents/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns incident admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/incidents/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        totalRecords: expect.any(Number),
      },
    })
  })

  it('rejects incident admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/incidents/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('release rollout integration', () => {
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

  it('reports release capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/releases/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReleaseRollout: true,
      supportsReleaseAdminTools: true,
      supportsApiVersionMetadata: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/releases/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns release admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/releases/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        totalRecords: expect.any(Number),
        apiVersion: '0.0.0',
      },
    })
  })

  it('rejects release admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/releases/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('SLO rollout integration', () => {
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

  it('reports SLO capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/slo/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSloRollout: true,
      supportsSloAdminTools: true,
      supportsUsageEventSloSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/slo/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns SLO admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/slo/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        successRatePercent: expect.any(Number),
      },
    })
  })

  it('rejects SLO admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/slo/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('capacity rollout integration', () => {
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

  it('reports capacity capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/capacity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCapacityRollout: true,
      supportsCapacityAdminTools: true,
      supportsUsageLimitsCapacitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/capacity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns capacity admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/capacity/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        loadUtilizationPercent: expect.any(Number),
      },
    })
  })

  it('rejects capacity admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/capacity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('performance rollout integration', () => {
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

  it('reports performance capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/performance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPerformanceRollout: true,
      supportsPerformanceAdminTools: true,
      supportsPipelineLatencySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/performance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns performance admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/performance/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        averageLatencyMs: expect.any(Number),
        latencySignalPercent: expect.any(Number),
      },
    })
  })

  it('rejects performance admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/performance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('resilience rollout integration', () => {
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

  it('reports resilience capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/resilience/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResilienceRollout: true,
      supportsResilienceAdminTools: true,
      supportsRunWorkflowRecoverySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/resilience/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns resilience admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/resilience/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        recoveryReadinessPercent: expect.any(Number),
      },
    })
  })

  it('rejects resilience admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/resilience/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('availability rollout integration', () => {
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

  it('reports availability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/availability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAvailabilityRollout: true,
      supportsAvailabilityAdminTools: true,
      supportsRunOutcomeAvailabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/availability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns availability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/availability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        availabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects availability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/availability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('reliability rollout integration', () => {
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

  it('reports reliability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/reliability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReliabilityRollout: true,
      supportsReliabilityAdminTools: true,
      supportsIdempotencyFaultTolerance: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/reliability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reliability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/reliability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        reliabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reliability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/reliability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('stability rollout integration', () => {
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

  it('reports stability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/stability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStabilityRollout: true,
      supportsStabilityAdminTools: true,
      supportsSchemaMigrationStability: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/stability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/stability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        stabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects stability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/stability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('consistency rollout integration', () => {
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

  it('reports consistency capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/consistency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConsistencyRollout: true,
      supportsConsistencyAdminTools: true,
      supportsIdempotencyConsistencySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/consistency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns consistency admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/consistency/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        consistencyPercent: expect.any(Number),
      },
    })
  })

  it('rejects consistency admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/consistency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('integrity rollout integration', () => {
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

  it('reports integrity capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/integrity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrityRollout: true,
      supportsIntegrityAdminTools: true,
      supportsShieldScanIntegritySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/integrity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrity admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/integrity/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        integrityPercent: expect.any(Number),
      },
    })
  })

  it('rejects integrity admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/integrity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('durability rollout integration', () => {
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

  it('reports durability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/durability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDurabilityRollout: true,
      supportsDurabilityAdminTools: true,
      supportsRedisPersistenceSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/durability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns durability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/durability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        durabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects durability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/durability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('recoverability rollout integration', () => {
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

  it('reports recoverability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/recoverability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRecoverabilityRollout: true,
      supportsRecoverabilityAdminTools: true,
      supportsStreamRecoverySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/recoverability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns recoverability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/recoverability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        recoverabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects recoverability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/recoverability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('maintainability rollout integration', () => {
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

  it('reports maintainability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/maintainability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMaintainabilityRollout: true,
      supportsMaintainabilityAdminTools: true,
      supportsModelHealthMaintainabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/maintainability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns maintainability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/maintainability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        maintainabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects maintainability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/maintainability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('scalability rollout integration', () => {
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

  it('reports scalability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/scalability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScalabilityRollout: true,
      supportsScalabilityAdminTools: true,
      supportsUsageLimitScalabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/scalability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scalability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/scalability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        scalabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects scalability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/scalability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('traceability rollout integration', () => {
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

  it('reports traceability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/traceability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTraceabilityRollout: true,
      supportsTraceabilityAdminTools: true,
      supportsArtifactLineageSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/traceability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns traceability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/traceability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        traceabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects traceability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/traceability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('efficiency rollout integration', () => {
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

  it('reports efficiency capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/efficiency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEfficiencyRollout: true,
      supportsEfficiencyAdminTools: true,
      supportsCostLimitEfficiencySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/efficiency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns efficiency admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/efficiency/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        efficiencyPercent: expect.any(Number),
      },
    })
  })

  it('rejects efficiency admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/efficiency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('optimization rollout integration', () => {
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

  it('reports optimization capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/optimization/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOptimizationRollout: true,
      supportsOptimizationAdminTools: true,
      supportsModelHealthOptimizationSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/optimization/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns optimization admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/optimization/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        optimizationPercent: expect.any(Number),
      },
    })
  })

  it('rejects optimization admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/optimization/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('utilization rollout integration', () => {
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

  it('reports utilization capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/utilization/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUtilizationRollout: true,
      supportsUtilizationAdminTools: true,
      supportsMembershipUtilizationSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/utilization/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns utilization admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/utilization/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        utilizationPercent: expect.any(Number),
      },
    })
  })

  it('rejects utilization admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/utilization/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('sustainability rollout integration', () => {
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

  it('reports sustainability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/sustainability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSustainabilityRollout: true,
      supportsSustainabilityAdminTools: true,
      supportsBillingSustainabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/sustainability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns sustainability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/sustainability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        sustainabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects sustainability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/sustainability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('governance rollout integration', () => {
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

  it('reports governance capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/governance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGovernanceRollout: true,
      supportsGovernanceAdminTools: true,
      supportsAccessGovernanceSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/governance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns governance admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/governance/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        governancePercent: expect.any(Number),
      },
    })
  })

  it('rejects governance admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/governance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('oversight rollout integration', () => {
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

  it('reports oversight capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/oversight/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOversightRollout: true,
      supportsOversightAdminTools: true,
      supportsBillingOversightSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/oversight/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns oversight admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/oversight/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        oversightPercent: expect.any(Number),
      },
    })
  })

  it('rejects oversight admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/oversight/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('assurance rollout integration', () => {
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

  it('reports assurance capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/assurance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssuranceRollout: true,
      supportsAssuranceAdminTools: true,
      supportsShieldQualityAssuranceSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/assurance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assurance admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/assurance/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        assurancePercent: expect.any(Number),
      },
    })
  })

  it('rejects assurance admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/assurance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('accountability rollout integration', () => {
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

  it('reports accountability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/accountability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAccountabilityRollout: true,
      supportsAccountabilityAdminTools: true,
      supportsIdempotencyAccountabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/accountability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns accountability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/accountability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        accountabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects accountability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/accountability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('transparency rollout integration', () => {
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

  it('reports transparency capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/transparency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTransparencyRollout: true,
      supportsTransparencyAdminTools: true,
      supportsWorkflowTransparencySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/transparency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns transparency admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/transparency/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        transparencyPercent: expect.any(Number),
      },
    })
  })

  it('rejects transparency admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/transparency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('attestation rollout integration', () => {
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

  it('reports attestation capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/attestation/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttestationRollout: true,
      supportsAttestationAdminTools: true,
      supportsModelRegistryAttestationSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/attestation/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attestation admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/attestation/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attestationPercent: expect.any(Number),
      },
    })
  })

  it('rejects attestation admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/attestation/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('authenticity rollout integration', () => {
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

  it('reports authenticity capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/authenticity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuthenticityRollout: true,
      supportsAuthenticityAdminTools: true,
      supportsSynthesisAuthenticitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/authenticity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns authenticity admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/authenticity/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        authenticityPercent: expect.any(Number),
      },
    })
  })

  it('rejects authenticity admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/authenticity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('provenance rollout integration', () => {
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

  it('reports provenance capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/provenance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProvenanceRollout: true,
      supportsProvenanceAdminTools: true,
      supportsUsageProvenanceSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/provenance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns provenance admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/provenance/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        provenancePercent: expect.any(Number),
      },
    })
  })

  it('rejects provenance admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/provenance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('verifiability rollout integration', () => {
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

  it('reports verifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/verifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVerifiabilityRollout: true,
      supportsVerifiabilityAdminTools: true,
      supportsBillingInvoiceVerifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/verifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns verifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/verifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        verifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects verifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/verifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('confirmability rollout integration', () => {
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

  it('reports confirmability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/confirmability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConfirmabilityRollout: true,
      supportsConfirmabilityAdminTools: true,
      supportsBillingNotificationConfirmabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/confirmability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns confirmability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/confirmability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        confirmabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects confirmability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/confirmability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('validity rollout integration', () => {
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

  it('reports validity capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/validity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsValidityRollout: true,
      supportsValidityAdminTools: true,
      supportsAgentOutputValiditySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/validity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns validity admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/validity/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        validityPercent: expect.any(Number),
      },
    })
  })

  it('rejects validity admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/validity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('credibility rollout integration', () => {
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

  it('reports credibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/credibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCredibilityRollout: true,
      supportsCredibilityAdminTools: true,
      supportsBillingInvoiceCredibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/credibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns credibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/credibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        credibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects credibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/credibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reproducibility rollout integration', () => {
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

  it('reports reproducibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/reproducibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReproducibilityRollout: true,
      supportsReproducibilityAdminTools: true,
      supportsIdempotencyReproducibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/reproducibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reproducibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/reproducibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        reproducibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reproducibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/reproducibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('defensibility rollout integration', () => {
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

  it('reports defensibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/defensibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDefensibilityRollout: true,
      supportsDefensibilityAdminTools: true,
      supportsShieldReviewDefensibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/defensibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns defensibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/defensibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        defensibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects defensibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/defensibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('auditability rollout integration', () => {
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

  it('reports auditability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/auditability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditabilityRollout: true,
      supportsAuditabilityAdminTools: true,
      supportsUsageAuditabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/auditability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/auditability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/auditability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('inspectability rollout integration', () => {
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

  it('reports inspectability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/inspectability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInspectabilityRollout: true,
      supportsInspectabilityAdminTools: true,
      supportsUsageInspectabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/inspectability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inspectability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/inspectability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        inspectabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects inspectability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/inspectability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('explainability rollout integration', () => {
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

  it('reports explainability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/explainability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExplainabilityRollout: true,
      supportsExplainabilityAdminTools: true,
      supportsSynthesisExplainabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/explainability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns explainability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/explainability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        explainabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects explainability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/explainability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('demonstrability rollout integration', () => {
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

  it('reports demonstrability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/demonstrability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDemonstrabilityRollout: true,
      supportsDemonstrabilityAdminTools: true,
      supportsWorkflowDemonstrabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/demonstrability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns demonstrability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/demonstrability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        demonstrabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects demonstrability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/demonstrability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('justifiability rollout integration', () => {
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

  it('reports justifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/justifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsJustifiabilityRollout: true,
      supportsJustifiabilityAdminTools: true,
      supportsShieldReviewJustifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/justifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns justifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/justifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        justifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects justifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/justifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reviewability rollout integration', () => {
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

  it('reports reviewability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/reviewability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReviewabilityRollout: true,
      supportsReviewabilityAdminTools: true,
      supportsArtifactReviewabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/reviewability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reviewability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/reviewability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        reviewabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reviewability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/reviewability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('assessability rollout integration', () => {
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

  it('reports assessability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/assessability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssessabilityRollout: true,
      supportsAssessabilityAdminTools: true,
      supportsModelHealthAssessabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/assessability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assessability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/assessability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        assessabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects assessability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/assessability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('measurability rollout integration', () => {
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

  it('reports measurability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/measurability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMeasurabilityRollout: true,
      supportsMeasurabilityAdminTools: true,
      supportsMeterUsageMeasurabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/measurability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns measurability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/measurability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        measurabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects measurability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/measurability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('certifiability rollout integration', () => {
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

  it('reports certifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/certifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCertifiabilityRollout: true,
      supportsCertifiabilityAdminTools: true,
      supportsProviderCredentialCertifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/certifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns certifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/certifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        certifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects certifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/certifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('substantiability rollout integration', () => {
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

  it('reports substantiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/substantiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSubstantiabilityRollout: true,
      supportsSubstantiabilityAdminTools: true,
      supportsBillingRecordSubstantiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/substantiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns substantiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/substantiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        substantiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects substantiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/substantiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('warrantability rollout integration', () => {
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

  it('reports warrantability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/warrantability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWarrantabilityRollout: true,
      supportsWarrantabilityAdminTools: true,
      supportsShieldScanWarrantabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/warrantability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns warrantability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/warrantability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        warrantabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects warrantability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/warrantability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('attributability rollout integration', () => {
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

  it('reports attributability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/attributability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttributabilityRollout: true,
      supportsAttributabilityAdminTools: true,
      supportsAgentOutputAttributabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/attributability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attributability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/attributability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attributabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects attributability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/attributability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('identifiability rollout integration', () => {
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

  it('reports identifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/identifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIdentifiabilityRollout: true,
      supportsIdentifiabilityAdminTools: true,
      supportsIdempotencyKeyIdentifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/identifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns identifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/identifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        identifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects identifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/identifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('comparability rollout integration', () => {
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

  it('reports comparability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/comparability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComparabilityRollout: true,
      supportsComparabilityAdminTools: true,
      supportsBillingInvoiceComparabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/comparability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns comparability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/comparability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        comparabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects comparability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/comparability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('distinguishability rollout integration', () => {
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

  it('reports distinguishability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/distinguishability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDistinguishabilityRollout: true,
      supportsDistinguishabilityAdminTools: true,
      supportsSynthesisDistinguishabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/distinguishability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns distinguishability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/distinguishability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        distinguishabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects distinguishability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/distinguishability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('assignability rollout integration', () => {
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

  it('reports assignability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/assignability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssignabilityRollout: true,
      supportsAssignabilityAdminTools: true,
      supportsWorkspaceMembershipAssignabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/assignability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assignability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/assignability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        assignabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects assignability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/assignability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('referencability rollout integration', () => {
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

  it('reports referencability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/referencability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReferencabilityRollout: true,
      supportsReferencabilityAdminTools: true,
      supportsArtifactReferencabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/referencability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns referencability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/referencability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        referencabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects referencability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/referencability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('locatability rollout integration', () => {
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

  it('reports locatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/locatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLocatabilityRollout: true,
      supportsLocatabilityAdminTools: true,
      supportsProviderCredentialLocatabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/locatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns locatability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/locatability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        locatabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects locatability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/locatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('retrievability rollout integration', () => {
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

  it('reports retrievability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/retrievability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRetrievabilityRollout: true,
      supportsRetrievabilityAdminTools: true,
      supportsShieldScanRetrievabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/retrievability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns retrievability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/retrievability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        retrievabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects retrievability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/retrievability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('discoverability rollout integration', () => {
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

  it('reports discoverability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/discoverability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiscoverabilityRollout: true,
      supportsDiscoverabilityAdminTools: true,
      supportsMeterUsageDiscoverabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/discoverability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns discoverability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/discoverability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        discoverabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects discoverability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/discoverability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('navigability rollout integration', () => {
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

  it('reports navigability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/navigability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNavigabilityRollout: true,
      supportsNavigabilityAdminTools: true,
      supportsWorkflowNavigabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/navigability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns navigability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/navigability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        navigabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects navigability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/navigability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('connectability rollout integration', () => {
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

  it('reports connectability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/connectability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConnectabilityRollout: true,
      supportsConnectabilityAdminTools: true,
      supportsUsageEventConnectabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/connectability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns connectability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/connectability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        connectabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects connectability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/connectability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('linkability rollout integration', () => {
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

  it('reports linkability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/linkability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLinkabilityRollout: true,
      supportsLinkabilityAdminTools: true,
      supportsWorkflowLinkabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/linkability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns linkability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/linkability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        linkabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects linkability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/linkability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interchangeability rollout integration', () => {
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

  it('reports interchangeability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/interchangeability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterchangeabilityRollout: true,
      supportsInterchangeabilityAdminTools: true,
      supportsMeterUsageInterchangeabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/interchangeability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interchangeability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/interchangeability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        interchangeabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects interchangeability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/interchangeability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('transferability rollout integration', () => {
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

  it('reports transferability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/transferability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTransferabilityRollout: true,
      supportsTransferabilityAdminTools: true,
      supportsBillingRecordTransferabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/transferability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns transferability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/transferability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        transferabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects transferability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/transferability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('portability rollout integration', () => {
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

  it('reports portability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/portability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPortabilityRollout: true,
      supportsPortabilityAdminTools: true,
      supportsArtifactPortabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/portability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns portability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/portability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        portabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects portability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/portability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('compatibility rollout integration', () => {
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

  it('reports compatibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/compatibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompatibilityRollout: true,
      supportsCompatibilityAdminTools: true,
      supportsProviderCredentialCompatibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/compatibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compatibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/compatibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compatibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compatibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/compatibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adaptability rollout integration', () => {
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

  it('reports adaptability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/adaptability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdaptabilityRollout: true,
      supportsAdaptabilityAdminTools: true,
      supportsBillingWebhookAdaptabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/adaptability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adaptability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/adaptability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        adaptabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects adaptability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/adaptability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('flexibility rollout integration', () => {
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

  it('reports flexibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/flexibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFlexibilityRollout: true,
      supportsFlexibilityAdminTools: true,
      supportsWorkflowFlexibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/flexibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns flexibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/flexibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        flexibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects flexibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/flexibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('extensibility rollout integration', () => {
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

  it('reports extensibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/extensibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExtensibilityRollout: true,
      supportsExtensibilityAdminTools: true,
      supportsAgentOutputExtensibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/extensibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns extensibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/extensibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        extensibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects extensibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/extensibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('modifiability rollout integration', () => {
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

  it('reports modifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/modifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsModifiabilityRollout: true,
      supportsModifiabilityAdminTools: true,
      supportsIdempotencyKeyModifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/modifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns modifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/modifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        modifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects modifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/modifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('configurability rollout integration', () => {
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

  it('reports configurability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/configurability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConfigurabilityRollout: true,
      supportsConfigurabilityAdminTools: true,
      supportsProviderCredentialConfigurabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/configurability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns configurability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/configurability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        configurabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects configurability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/configurability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('customizability rollout integration', () => {
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

  it('reports customizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/customizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCustomizabilityRollout: true,
      supportsCustomizabilityAdminTools: true,
      supportsWorkflowCustomizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/customizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns customizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/customizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        customizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects customizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/customizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('operability rollout integration', () => {
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

  it('reports operability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/operability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOperabilityRollout: true,
      supportsOperabilityAdminTools: true,
      supportsBillingNotificationOperabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/operability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns operability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/operability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        operabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects operability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/operability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tunability rollout integration', () => {
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

  it('reports tunability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/tunability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTunabilityRollout: true,
      supportsTunabilityAdminTools: true,
      supportsUsageEventTunabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/tunability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tunability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/tunability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        tunabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects tunability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/tunability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adjustability rollout integration', () => {
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

  it('reports adjustability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/adjustability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdjustabilityRollout: true,
      supportsAdjustabilityAdminTools: true,
      supportsBillingInvoiceAdjustabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/adjustability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adjustability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/adjustability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        adjustabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects adjustability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/adjustability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('programmability rollout integration', () => {
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

  it('reports programmability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/programmability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProgrammabilityRollout: true,
      supportsProgrammabilityAdminTools: true,
      supportsWorkflowProgrammabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/programmability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns programmability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/programmability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        programmabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects programmability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/programmability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deployability rollout integration', () => {
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

  it('reports deployability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/deployability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeployabilityRollout: true,
      supportsDeployabilityAdminTools: true,
      supportsProviderCredentialDeployabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/deployability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deployability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/deployability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        deployabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects deployability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/deployability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('manageability rollout integration', () => {
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

  it('reports manageability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/manageability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsManageabilityRollout: true,
      supportsManageabilityAdminTools: true,
      supportsBillingNotificationManageabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/manageability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns manageability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/manageability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        manageabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects manageability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/manageability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('controllability rollout integration', () => {
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

  it('reports controllability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/controllability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsControllabilityRollout: true,
      supportsControllabilityAdminTools: true,
      supportsIdempotencyKeyControllabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/controllability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns controllability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/controllability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        controllabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects controllability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/controllability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('integrability rollout integration', () => {
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

  it('reports integrability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/integrability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrabilityRollout: true,
      supportsIntegrabilityAdminTools: true,
      supportsBillingWebhookIntegrabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/integrability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/integrability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        integrabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects integrability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/integrability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('orchestrability rollout integration', () => {
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

  it('reports orchestrability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/orchestrability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrchestrabilityRollout: true,
      supportsOrchestrabilityAdminTools: true,
      supportsWorkflowOrchestrabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/orchestrability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns orchestrability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/orchestrability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        orchestrabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects orchestrability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/orchestrability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('schedulability rollout integration', () => {
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

  it('reports schedulability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/schedulability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSchedulabilityRollout: true,
      supportsSchedulabilityAdminTools: true,
      supportsMeterUsageSchedulabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/schedulability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns schedulability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/schedulability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        schedulabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects schedulability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/schedulability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('automatability rollout integration', () => {
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

  it('reports automatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/automatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAutomatabilityRollout: true,
      supportsAutomatabilityAdminTools: true,
      supportsAgentOutputAutomatabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/automatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns automatability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/automatability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        automatabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects automatability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/automatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('monitorability rollout integration', () => {
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

  it('reports monitorability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/monitorability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMonitorabilityRollout: true,
      supportsMonitorabilityAdminTools: true,
      supportsUsageEventMonitorabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/monitorability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns monitorability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/monitorability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        monitorabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects monitorability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/monitorability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('predictability rollout integration', () => {
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

  it('reports predictability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/predictability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPredictabilityRollout: true,
      supportsPredictabilityAdminTools: true,
      supportsSynthesisPredictabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/predictability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns predictability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/predictability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        predictabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects predictability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/predictability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('repeatability rollout integration', () => {
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

  it('reports repeatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/repeatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRepeatabilityRollout: true,
      supportsRepeatabilityAdminTools: true,
      supportsArtifactRepeatabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/repeatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns repeatability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/repeatability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        repeatabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects repeatability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/repeatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('responsiveness rollout integration', () => {
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

  it('reports responsiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/responsiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResponsivenessRollout: true,
      supportsResponsivenessAdminTools: true,
      supportsUsageEventResponsivenessSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/responsiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns responsiveness admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/responsiveness/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        responsivenessPercent: expect.any(Number),
      },
    })
  })

  it('rejects responsiveness admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/responsiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dependability rollout integration', () => {
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

  it('reports dependability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/dependability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDependabilityRollout: true,
      supportsDependabilityAdminTools: true,
      supportsBillingRecordDependabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/dependability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dependability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/dependability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        dependabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects dependability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/dependability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('composability rollout integration', () => {
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

  it('reports composability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/composability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComposabilityRollout: true,
      supportsComposabilityAdminTools: true,
      supportsWorkflowComposabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/composability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns composability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/composability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        composabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects composability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/composability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('trustworthiness rollout integration', () => {
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

  it('reports trustworthiness capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/trustworthiness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTrustworthinessRollout: true,
      supportsTrustworthinessAdminTools: true,
      supportsShieldScanTrustworthinessSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/trustworthiness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns trustworthiness admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/trustworthiness/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        trustworthinessPercent: expect.any(Number),
      },
    })
  })

  it('rejects trustworthiness admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/trustworthiness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('usability rollout integration', () => {
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

  it('reports usability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/usability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUsabilityRollout: true,
      supportsUsabilityAdminTools: true,
      supportsMembershipUsabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/usability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns usability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/usability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        usabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects usability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/usability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('accessibility rollout integration', () => {
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

  it('reports accessibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/accessibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAccessibilityRollout: true,
      supportsAccessibilityAdminTools: true,
      supportsIdempotencyKeyAccessibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/accessibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns accessibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/accessibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        accessibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects accessibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/accessibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('effectiveness rollout integration', () => {
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

  it('reports effectiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/effectiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEffectivenessRollout: true,
      supportsEffectivenessAdminTools: true,
      supportsAgentOutputEffectivenessSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/effectiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns effectiveness admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/effectiveness/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        effectivenessPercent: expect.any(Number),
      },
    })
  })

  it('rejects effectiveness admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/effectiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('appropriateness rollout integration', () => {
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

  it('reports appropriateness capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/appropriateness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAppropriatenessRollout: true,
      supportsAppropriatenessAdminTools: true,
      supportsBillingInvoiceAppropriatenessSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/appropriateness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns appropriateness admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/appropriateness/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        appropriatenessPercent: expect.any(Number),
      },
    })
  })

  it('rejects appropriateness admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/appropriateness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('survivability rollout integration', () => {
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

  it('reports survivability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/survivability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSurvivabilityRollout: true,
      supportsSurvivabilityAdminTools: true,
      supportsBillingRecordSurvivabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/survivability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns survivability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/survivability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        survivabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects survivability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/survivability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('viability rollout integration', () => {
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

  it('reports viability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/viability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsViabilityRollout: true,
      supportsViabilityAdminTools: true,
      supportsBillingInvoiceViabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/viability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns viability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/viability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        viabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects viability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/viability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('feasibility rollout integration', () => {
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

  it('reports feasibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/feasibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFeasibilityRollout: true,
      supportsFeasibilityAdminTools: true,
      supportsProviderCredentialFeasibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/feasibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns feasibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/feasibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        feasibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects feasibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/feasibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('conformance rollout integration', () => {
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

  it('reports conformance capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/conformance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConformanceRollout: true,
      supportsConformanceAdminTools: true,
      supportsShieldScanConformanceSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/conformance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns conformance admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/conformance/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        conformancePercent: expect.any(Number),
      },
    })
  })

  it('rejects conformance admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/conformance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adoptability rollout integration', () => {
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

  it('reports adoptability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/adoptability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdoptabilityRollout: true,
      supportsAdoptabilityAdminTools: true,
      supportsUsageEventAdoptabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/adoptability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adoptability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/adoptability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        adoptabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects adoptability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/adoptability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('acceptability rollout integration', () => {
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

  it('reports acceptability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/acceptability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAcceptabilityRollout: true,
      supportsAcceptabilityAdminTools: true,
      supportsBillingRecordAcceptabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/acceptability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns acceptability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/acceptability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        acceptabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects acceptability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/acceptability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('affordability rollout integration', () => {
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

  it('reports affordability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/affordability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAffordabilityRollout: true,
      supportsAffordabilityAdminTools: true,
      supportsBillingInvoiceAffordabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/affordability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns affordability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/affordability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        affordabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects affordability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/affordability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('desirability rollout integration', () => {
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

  it('reports desirability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/desirability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDesirabilityRollout: true,
      supportsDesirabilityAdminTools: true,
      supportsUsageEventDesirabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/desirability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns desirability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/desirability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        desirabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects desirability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/desirability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('marketability rollout integration', () => {
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

  it('reports marketability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/marketability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMarketabilityRollout: true,
      supportsMarketabilityAdminTools: true,
      supportsMembershipMarketabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/marketability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns marketability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/marketability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        marketabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects marketability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/marketability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('suitability rollout integration', () => {
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

  it('reports suitability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/suitability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSuitabilityRollout: true,
      supportsSuitabilityAdminTools: true,
      supportsAgentOutputSuitabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/suitability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns suitability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/suitability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        suitabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects suitability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/suitability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('profitability rollout integration', () => {
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

  it('reports profitability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/profitability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProfitabilityRollout: true,
      supportsProfitabilityAdminTools: true,
      supportsBillingRecordProfitabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/profitability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns profitability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/profitability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        profitabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects profitability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/profitability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('learnability rollout integration', () => {
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

  it('reports learnability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/learnability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLearnabilityRollout: true,
      supportsLearnabilityAdminTools: true,
      supportsAgentOutputLearnabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/learnability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns learnability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/learnability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        learnabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects learnability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/learnability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deliverability rollout integration', () => {
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

  it('reports deliverability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/deliverability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeliverabilityRollout: true,
      supportsDeliverabilityAdminTools: true,
      supportsBillingNotificationDeliverabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/deliverability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deliverability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/deliverability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        deliverabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects deliverability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/deliverability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('understandability rollout integration', () => {
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

  it('reports understandability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/understandability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUnderstandabilityRollout: true,
      supportsUnderstandabilityAdminTools: true,
      supportsSynthesisUnderstandabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/understandability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns understandability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/understandability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        understandabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects understandability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/understandability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('memorability rollout integration', () => {
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

  it('reports memorability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/memorability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMemorabilityRollout: true,
      supportsMemorabilityAdminTools: true,
      supportsArtifactMemorabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/memorability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns memorability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/memorability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        memorabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects memorability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/memorability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('teachability rollout integration', () => {
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

  it('reports teachability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/teachability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTeachabilityRollout: true,
      supportsTeachabilityAdminTools: true,
      supportsWorkflowTeachabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/teachability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns teachability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/teachability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        teachabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects teachability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/teachability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('readability rollout integration', () => {
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

  it('reports readability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/readability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReadabilityRollout: true,
      supportsReadabilityAdminTools: true,
      supportsArtifactReadabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/readability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns readability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/readability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        readabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects readability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/readability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('clarity rollout integration', () => {
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

  it('reports clarity capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/clarity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsClarityRollout: true,
      supportsClarityAdminTools: true,
      supportsSynthesisClaritySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/clarity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns clarity admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/clarity/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        clarityPercent: expect.any(Number),
      },
    })
  })

  it('rejects clarity admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/clarity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('simplicity rollout integration', () => {
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

  it('reports simplicity capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/simplicity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSimplicityRollout: true,
      supportsSimplicityAdminTools: true,
      supportsWorkflowSimplicitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/simplicity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns simplicity admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/simplicity/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        simplicityPercent: expect.any(Number),
      },
    })
  })

  it('rejects simplicity admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/simplicity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('negotiability rollout integration', () => {
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

  it('reports negotiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/negotiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNegotiabilityRollout: true,
      supportsNegotiabilityAdminTools: true,
      supportsBillingInvoiceNegotiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/negotiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns negotiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/negotiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        negotiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects negotiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/negotiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('comprehensibility rollout integration', () => {
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

  it('reports comprehensibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/comprehensibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComprehensibilityRollout: true,
      supportsComprehensibilityAdminTools: true,
      supportsAgentOutputComprehensibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/comprehensibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns comprehensibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/comprehensibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        comprehensibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects comprehensibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/comprehensibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('intelligibility rollout integration', () => {
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

  it('reports intelligibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/intelligibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntelligibilityRollout: true,
      supportsIntelligibilityAdminTools: true,
      supportsSynthesisIntelligibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/intelligibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns intelligibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/intelligibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        intelligibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects intelligibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/intelligibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('legibility rollout integration', () => {
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

  it('reports legibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/legibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLegibilityRollout: true,
      supportsLegibilityAdminTools: true,
      supportsArtifactLegibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/legibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns legibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/legibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        legibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects legibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/legibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('parsability rollout integration', () => {
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

  it('reports parsability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/parsability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsParsabilityRollout: true,
      supportsParsabilityAdminTools: true,
      supportsIdempotencyKeyParsabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/parsability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns parsability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/parsability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        parsabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects parsability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/parsability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('coherence rollout integration', () => {
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

  it('reports coherence capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/coherence/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCoherenceRollout: true,
      supportsCoherenceAdminTools: true,
      supportsWorkflowCoherenceSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/coherence/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns coherence admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/coherence/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        coherencePercent: expect.any(Number),
      },
    })
  })

  it('rejects coherence admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/coherence/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('familiarity rollout integration', () => {
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

  it('reports familiarity capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/familiarity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFamiliarityRollout: true,
      supportsFamiliarityAdminTools: true,
      supportsMembershipFamiliaritySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/familiarity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns familiarity admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/familiarity/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        familiarityPercent: expect.any(Number),
      },
    })
  })

  it('rejects familiarity admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/familiarity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('recognizability rollout integration', () => {
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

  it('reports recognizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/recognizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRecognizabilityRollout: true,
      supportsRecognizabilityAdminTools: true,
      supportsArtifactRecognizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/recognizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns recognizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/recognizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        recognizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects recognizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/recognizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interpretability rollout integration', () => {
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

  it('reports interpretability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/interpretability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterpretabilityRollout: true,
      supportsInterpretabilityAdminTools: true,
      supportsAgentOutputInterpretabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/interpretability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interpretability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/interpretability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        interpretabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects interpretability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/interpretability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('scannability rollout integration', () => {
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

  it('reports scannability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/scannability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScannabilityRollout: true,
      supportsScannabilityAdminTools: true,
      supportsShieldScanScannabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/scannability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scannability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/scannability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        scannabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects scannability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/scannability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('perceptibility rollout integration', () => {
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

  it('reports perceptibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/perceptibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPerceptibilityRollout: true,
      supportsPerceptibilityAdminTools: true,
      supportsUsageEventPerceptibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/perceptibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns perceptibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/perceptibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        perceptibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects perceptibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/perceptibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('noticeability rollout integration', () => {
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

  it('reports noticeability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/noticeability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNoticeabilityRollout: true,
      supportsNoticeabilityAdminTools: true,
      supportsBillingNotificationNoticeabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/noticeability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns noticeability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/noticeability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        noticeabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects noticeability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/noticeability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('discernibility rollout integration', () => {
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

  it('reports discernibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/discernibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiscernibilityRollout: true,
      supportsDiscernibilityAdminTools: true,
      supportsSynthesisDiscernibilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/discernibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns discernibility admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/discernibility/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        discernibilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects discernibility admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/discernibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('distinctiveness rollout integration', () => {
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

  it('reports distinctiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/distinctiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDistinctivenessRollout: true,
      supportsDistinctivenessAdminTools: true,
      supportsIdempotencyKeyDistinctivenessSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/distinctiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns distinctiveness admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/distinctiveness/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        distinctivenessPercent: expect.any(Number),
      },
    })
  })

  it('rejects distinctiveness admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/distinctiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('conspicuousness rollout integration', () => {
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

  it('reports conspicuousness capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/conspicuousness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConspicuousnessRollout: true,
      supportsConspicuousnessAdminTools: true,
      supportsMembershipConspicuousnessSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/conspicuousness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns conspicuousness admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/conspicuousness/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        conspicuousnessPercent: expect.any(Number),
      },
    })
  })

  it('rejects conspicuousness admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/conspicuousness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('detectability rollout integration', () => {
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

  it('reports detectability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/detectability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDetectabilityRollout: true,
      supportsDetectabilityAdminTools: true,
      supportsBillingWebhookDetectabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/detectability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns detectability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/detectability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        detectabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects detectability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/detectability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('describability rollout integration', () => {
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

  it('reports describability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/describability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDescribabilityRollout: true,
      supportsDescribabilityAdminTools: true,
      supportsWorkflowDescribabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/describability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns describability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/describability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        describabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects describability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/describability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('expressiveness rollout integration', () => {
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

  it('reports expressiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/expressiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExpressivenessRollout: true,
      supportsExpressivenessAdminTools: true,
      supportsAgentOutputExpressivenessSignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/expressiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns expressiveness admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/expressiveness/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        expressivenessPercent: expect.any(Number),
      },
    })
  })

  it('rejects expressiveness admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/expressiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('communicability rollout integration', () => {
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

  it('reports communicability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/communicability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCommunicabilityRollout: true,
      supportsCommunicabilityAdminTools: true,
      supportsSynthesisCommunicabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/communicability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns communicability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/communicability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        communicabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects communicability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/communicability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('articulability rollout integration', () => {
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

  it('reports articulability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/articulability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsArticulabilityRollout: true,
      supportsArticulabilityAdminTools: true,
      supportsArtifactArticulabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/articulability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns articulability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/articulability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        articulabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects articulability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/articulability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('elaboratability rollout integration', () => {
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

  it('reports elaboratability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/elaboratability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsElaboratabilityRollout: true,
      supportsElaboratabilityAdminTools: true,
      supportsWorkflowElaboratabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/elaboratability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns elaboratability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/elaboratability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        elaboratabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects elaboratability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/elaboratability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('representability rollout integration', () => {
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

  it('reports representability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/representability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRepresentabilityRollout: true,
      supportsRepresentabilityAdminTools: true,
      supportsBillingInvoiceRepresentabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/representability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns representability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/representability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        representabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects representability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/representability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('presentability rollout integration', () => {
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

  it('reports presentability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/presentability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPresentabilityRollout: true,
      supportsPresentabilityAdminTools: true,
      supportsUsageEventPresentabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/presentability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns presentability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/presentability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        presentabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects presentability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/presentability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('enunciability rollout integration', () => {
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

  it('reports enunciability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/enunciability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEnunciabilityRollout: true,
      supportsEnunciabilityAdminTools: true,
      supportsBillingNotificationEnunciabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/enunciability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns enunciability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/enunciability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        enunciabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects enunciability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/enunciability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('formulatability rollout integration', () => {
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

  it('reports formulatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/formulatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFormulatabilityRollout: true,
      supportsFormulatabilityAdminTools: true,
      supportsIdempotencyKeyFormulatabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/formulatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns formulatability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/formulatability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        formulatabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects formulatability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/formulatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('narratability rollout integration', () => {
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

  it('reports narratability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/narratability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNarratabilityRollout: true,
      supportsNarratabilityAdminTools: true,
      supportsMembershipNarratabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/narratability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns narratability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/narratability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        narratabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects narratability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/narratability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('illustratability rollout integration', () => {
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

  it('reports illustratability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/illustratability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIllustratabilityRollout: true,
      supportsIllustratabilityAdminTools: true,
      supportsShieldScanIllustratabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/illustratability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns illustratability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/illustratability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        illustratabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects illustratability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/illustratability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('symbolizability rollout integration', () => {
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

  it('reports symbolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/symbolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSymbolizabilityRollout: true,
      supportsSymbolizabilityAdminTools: true,
      supportsBillingRecordSymbolizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/symbolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns symbolizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/symbolizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        symbolizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects symbolizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/symbolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('visualizability rollout integration', () => {
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

  it('reports visualizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/visualizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVisualizabilityRollout: true,
      supportsVisualizabilityAdminTools: true,
      supportsModelRegistryVisualizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/visualizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns visualizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/visualizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        visualizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects visualizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/visualizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('evocatability rollout integration', () => {
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

  it('reports evocatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/evocatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEvocatabilityRollout: true,
      supportsEvocatabilityAdminTools: true,
      supportsModelHealthEvocatabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/evocatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns evocatability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/evocatability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        evocatabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects evocatability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/evocatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('signifiability rollout integration', () => {
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

  it('reports signifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/signifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSignifiabilityRollout: true,
      supportsSignifiabilityAdminTools: true,
      supportsBillingWebhookSignifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/signifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns signifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/signifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        signifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects signifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/signifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('connotability rollout integration', () => {
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

  it('reports connotability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/connotability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConnotabilityRollout: true,
      supportsConnotabilityAdminTools: true,
      supportsMeterUsageConnotabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/connotability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns connotability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/connotability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        connotabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects connotability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/connotability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('typifiability rollout integration', () => {
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

  it('reports typifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/typifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTypifiabilityRollout: true,
      supportsTypifiabilityAdminTools: true,
      supportsWorkspaceLimitTypifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/typifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns typifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/typifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        typifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects typifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/typifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('metaphorizability rollout integration', () => {
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

  it('reports metaphorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/metaphorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMetaphorizabilityRollout: true,
      supportsMetaphorizabilityAdminTools: true,
      supportsProviderCredentialMetaphorizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/metaphorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns metaphorizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/metaphorizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        metaphorizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects metaphorizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/metaphorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dramatizability rollout integration', () => {
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

  it('reports dramatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/dramatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDramatizabilityRollout: true,
      supportsDramatizabilityAdminTools: true,
      supportsArtifactDramatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/dramatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dramatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/dramatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        dramatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects dramatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/dramatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('personifiability rollout integration', () => {
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

  it('reports personifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/personifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPersonifiabilityRollout: true,
      supportsPersonifiabilityAdminTools: true,
      supportsAgentOutputPersonifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/personifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns personifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/personifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        personifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects personifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/personifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('materializability rollout integration', () => {
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

  it('reports materializability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/materializability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMaterializabilityRollout: true,
      supportsMaterializabilityAdminTools: true,
      supportsWorkflowMaterializabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/materializability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns materializability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/materializability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        materializabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects materializability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/materializability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('iconizability rollout integration', () => {
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

  it('reports iconizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/iconizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIconizabilityRollout: true,
      supportsIconizabilityAdminTools: true,
      supportsShieldScanIconizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/iconizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns iconizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/iconizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        iconizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects iconizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/iconizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('allegorizability rollout integration', () => {
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

  it('reports allegorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/allegorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAllegorizabilityRollout: true,
      supportsAllegorizabilityAdminTools: true,
      supportsIdempotencyKeyAllegorizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/allegorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns allegorizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/allegorizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        allegorizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects allegorizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/allegorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tokenizability rollout integration', () => {
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

  it('reports tokenizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/tokenizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTokenizabilityRollout: true,
      supportsTokenizabilityAdminTools: true,
      supportsMembershipTokenizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/tokenizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tokenizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/tokenizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        tokenizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects tokenizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/tokenizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stylizability rollout integration', () => {
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

  it('reports stylizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/stylizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStylizabilityRollout: true,
      supportsStylizabilityAdminTools: true,
      supportsBillingInvoiceStylizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/stylizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stylizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/stylizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        stylizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects stylizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/stylizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('emblemizability rollout integration', () => {
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

  it('reports emblemizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/emblemizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEmblemizabilityRollout: true,
      supportsEmblemizabilityAdminTools: true,
      supportsBillingNotificationEmblemizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/emblemizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns emblemizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/emblemizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        emblemizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects emblemizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/emblemizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('analogizability rollout integration', () => {
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

  it('reports analogizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/analogizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAnalogizabilityRollout: true,
      supportsAnalogizabilityAdminTools: true,
      supportsUsageEventAnalogizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/analogizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns analogizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/analogizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        analogizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects analogizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/analogizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('parabolizability rollout integration', () => {
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

  it('reports parabolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/parabolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsParabolizabilityRollout: true,
      supportsParabolizabilityAdminTools: true,
      supportsSynthesisParabolizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/parabolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns parabolizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/parabolizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        parabolizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects parabolizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/parabolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('archetypizability rollout integration', () => {
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

  it('reports archetypizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/archetypizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsArchetypizabilityRollout: true,
      supportsArchetypizabilityAdminTools: true,
      supportsBillingRecordArchetypizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/archetypizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns archetypizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/archetypizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        archetypizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects archetypizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/archetypizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('caracterizability rollout integration', () => {
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

  it('reports caracterizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/caracterizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCaracterizabilityRollout: true,
      supportsCaracterizabilityAdminTools: true,
      supportsWorkflowCaracterizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/caracterizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns caracterizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/caracterizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        caracterizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects caracterizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/caracterizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('mythicizability rollout integration', () => {
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

  it('reports mythicizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/mythicizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMythicizabilityRollout: true,
      supportsMythicizabilityAdminTools: true,
      supportsArtifactMythicizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/mythicizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns mythicizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/mythicizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        mythicizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects mythicizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/mythicizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('semiotizability rollout integration', () => {
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

  it('reports semiotizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/semiotizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSemiotizabilityRollout: true,
      supportsSemiotizabilityAdminTools: true,
      supportsShieldScanSemiotizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/semiotizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns semiotizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/semiotizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        semiotizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects semiotizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/semiotizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('hermeneutizability rollout integration', () => {
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

  it('reports hermeneutizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/hermeneutizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHermeneutizabilityRollout: true,
      supportsHermeneutizabilityAdminTools: true,
      supportsIdempotencyKeyHermeneutizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/hermeneutizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hermeneutizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/hermeneutizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        hermeneutizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects hermeneutizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/hermeneutizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('lexicalizability rollout integration', () => {
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

  it('reports lexicalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/lexicalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLexicalizabilityRollout: true,
      supportsLexicalizabilityAdminTools: true,
      supportsMembershipLexicalizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/lexicalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns lexicalizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/lexicalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        lexicalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects lexicalizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/lexicalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('semanticizability rollout integration', () => {
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

  it('reports semanticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/semanticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSemanticizabilityRollout: true,
      supportsSemanticizabilityAdminTools: true,
      supportsBillingInvoiceSemanticizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/semanticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns semanticizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/semanticizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        semanticizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects semanticizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/semanticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('pragmatizability rollout integration', () => {
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

  it('reports pragmatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/pragmatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPragmatizabilityRollout: true,
      supportsPragmatizabilityAdminTools: true,
      supportsBillingNotificationPragmatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/pragmatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns pragmatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/pragmatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        pragmatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects pragmatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/pragmatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('syntacticizability rollout integration', () => {
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

  it('reports syntacticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/syntacticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSyntacticizabilityRollout: true,
      supportsSyntacticizabilityAdminTools: true,
      supportsBillingWebhookSyntacticizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/syntacticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns syntacticizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/syntacticizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        syntacticizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects syntacticizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/syntacticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('rhetorizability rollout integration', () => {
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

  it('reports rhetorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/rhetorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRhetorizabilityRollout: true,
      supportsRhetorizabilityAdminTools: true,
      supportsMeterUsageRhetorizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/rhetorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns rhetorizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/rhetorizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        rhetorizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects rhetorizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/rhetorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('morphizability rollout integration', () => {
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

  it('reports morphizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/morphizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMorphizabilityRollout: true,
      supportsMorphizabilityAdminTools: true,
      supportsWorkspaceLimitMorphizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/morphizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns morphizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/morphizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        morphizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects morphizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/morphizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('codifiability rollout integration', () => {
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

  it('reports codifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/codifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCodifiabilityRollout: true,
      supportsCodifiabilityAdminTools: true,
      supportsProviderCredentialCodifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/codifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns codifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/codifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        codifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects codifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/codifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('hermeticizability rollout integration', () => {
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

  it('reports hermeticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/hermeticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHermeticizabilityRollout: true,
      supportsHermeticizabilityAdminTools: true,
      supportsModelHealthHermeticizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/hermeticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hermeticizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/hermeticizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        hermeticizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects hermeticizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/hermeticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('epistemizability rollout integration', () => {
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

  it('reports epistemizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/epistemizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEpistemizabilityRollout: true,
      supportsEpistemizabilityAdminTools: true,
      supportsShieldScanEpistemizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/epistemizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns epistemizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/epistemizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        epistemizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects epistemizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/epistemizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dialectizability rollout integration', () => {
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

  it('reports dialectizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/dialectizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDialectizabilityRollout: true,
      supportsDialectizabilityAdminTools: true,
      supportsIdempotencyKeyDialectizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/dialectizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dialectizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/dialectizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        dialectizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects dialectizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/dialectizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('ontologizability rollout integration', () => {
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

  it('reports ontologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/ontologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOntologizabilityRollout: true,
      supportsOntologizabilityAdminTools: true,
      supportsMembershipOntologizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/ontologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ontologizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/ontologizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        ontologizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects ontologizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/ontologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('phenomenizability rollout integration', () => {
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

  it('reports phenomenizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/phenomenizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPhenomenizabilityRollout: true,
      supportsPhenomenizabilityAdminTools: true,
      supportsBillingInvoicePhenomenizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/phenomenizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns phenomenizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/phenomenizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        phenomenizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects phenomenizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/phenomenizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('axiologizability rollout integration', () => {
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

  it('reports axiologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/axiologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAxiologizabilityRollout: true,
      supportsAxiologizabilityAdminTools: true,
      supportsBillingNotificationAxiologizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/axiologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns axiologizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/axiologizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        axiologizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects axiologizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/axiologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('teleologizability rollout integration', () => {
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

  it('reports teleologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/teleologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTeleologizabilityRollout: true,
      supportsTeleologizabilityAdminTools: true,
      supportsBillingWebhookTeleologizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/teleologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns teleologizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/teleologizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        teleologizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects teleologizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/teleologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('gnoseizability rollout integration', () => {
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

  it('reports gnoseizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/gnoseizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGnoseizabilityRollout: true,
      supportsGnoseizabilityAdminTools: true,
      supportsMeterUsageGnoseizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/gnoseizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns gnoseizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/gnoseizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        gnoseizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects gnoseizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/gnoseizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('methodizability rollout integration', () => {
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

  it('reports methodizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/methodizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMethodizabilityRollout: true,
      supportsMethodizabilityAdminTools: true,
      supportsWorkspaceLimitMethodizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/methodizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns methodizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/methodizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        methodizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects methodizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/methodizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('historizability rollout integration', () => {
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

  it('reports historizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/historizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHistorizabilityRollout: true,
      supportsHistorizabilityAdminTools: true,
      supportsProviderCredentialHistorizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/historizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns historizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/historizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        historizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects historizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/historizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('categorizability rollout integration', () => {
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

  it('reports categorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/categorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCategorizabilityRollout: true,
      supportsCategorizabilityAdminTools: true,
      supportsModelHealthCategorizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/categorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns categorizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/categorizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        categorizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects categorizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/categorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('taxonomizability rollout integration', () => {
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

  it('reports taxonomizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/taxonomizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTaxonomizabilityRollout: true,
      supportsTaxonomizabilityAdminTools: true,
      supportsShieldScanTaxonomizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/taxonomizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns taxonomizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/taxonomizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        taxonomizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects taxonomizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/taxonomizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('classifiability rollout integration', () => {
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

  it('reports classifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/classifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsClassifiabilityRollout: true,
      supportsClassifiabilityAdminTools: true,
      supportsIdempotencyKeyClassifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/classifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns classifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/classifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        classifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects classifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/classifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('typologizability rollout integration', () => {
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

  it('reports typologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/typologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTypologizabilityRollout: true,
      supportsTypologizabilityAdminTools: true,
      supportsMembershipTypologizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/typologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns typologizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/typologizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        typologizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects typologizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/typologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stratifiability rollout integration', () => {
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

  it('reports stratifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/stratifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStratifiabilityRollout: true,
      supportsStratifiabilityAdminTools: true,
      supportsBillingInvoiceStratifiabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/stratifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stratifiability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/stratifiability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        stratifiabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects stratifiability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/stratifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('ordinarizability rollout integration', () => {
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

  it('reports ordinarizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/ordinarizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrdinarizabilityRollout: true,
      supportsOrdinarizabilityAdminTools: true,
      supportsBillingNotificationOrdinarizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/ordinarizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ordinarizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/ordinarizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        ordinarizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects ordinarizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/ordinarizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('systematizability rollout integration', () => {
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

  it('reports systematizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/systematizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSystematizabilityRollout: true,
      supportsSystematizabilityAdminTools: true,
      supportsBillingWebhookSystematizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/systematizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns systematizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/systematizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        systematizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects systematizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/systematizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('hierarchizability rollout integration', () => {
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

  it('reports hierarchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/hierarchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHierarchizabilityRollout: true,
      supportsHierarchizabilityAdminTools: true,
      supportsMeterUsageHierarchizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/hierarchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hierarchizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/hierarchizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        hierarchizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects hierarchizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/hierarchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('segmentizability rollout integration', () => {
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

  it('reports segmentizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/segmentizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSegmentizabilityRollout: true,
      supportsSegmentizabilityAdminTools: true,
      supportsWorkspaceLimitSegmentizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/segmentizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns segmentizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/segmentizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        segmentizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects segmentizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/segmentizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('clusterizability rollout integration', () => {
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

  it('reports clusterizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/clusterizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsClusterizabilityRollout: true,
      supportsClusterizabilityAdminTools: true,
      supportsProviderCredentialClusterizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/clusterizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns clusterizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/clusterizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        clusterizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects clusterizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/clusterizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('nomenclatizability rollout integration', () => {
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

  it('reports nomenclatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/nomenclatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNomenclatizabilityRollout: true,
      supportsNomenclatizabilityAdminTools: true,
      supportsModelHealthNomenclatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/nomenclatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns nomenclatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/nomenclatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        nomenclatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects nomenclatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/nomenclatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('catalogizability rollout integration', () => {
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

  it('reports catalogizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/catalogizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCatalogizabilityRollout: true,
      supportsCatalogizabilityAdminTools: true,
      supportsShieldScanCatalogizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/catalogizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns catalogizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/catalogizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        catalogizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects catalogizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/catalogizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('indexizability rollout integration', () => {
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

  it('reports indexizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/indexizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIndexizabilityRollout: true,
      supportsIndexizabilityAdminTools: true,
      supportsIdempotencyKeyIndexizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/indexizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns indexizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/indexizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        indexizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects indexizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/indexizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('directoryizability rollout integration', () => {
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

  it('reports directoryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/directoryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDirectoryizabilityRollout: true,
      supportsDirectoryizabilityAdminTools: true,
      supportsMembershipDirectoryizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/directoryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns directoryizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/directoryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        directoryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects directoryizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/directoryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('inventoryizability rollout integration', () => {
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

  it('reports inventoryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/inventoryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInventoryizabilityRollout: true,
      supportsInventoryizabilityAdminTools: true,
      supportsBillingInvoiceInventoryizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/inventoryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inventoryizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/inventoryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        inventoryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects inventoryizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/inventoryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('registryizability rollout integration', () => {
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

  it('reports registryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/registryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegistryizabilityRollout: true,
      supportsRegistryizabilityAdminTools: true,
      supportsBillingNotificationRegistryizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/registryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns registryizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/registryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        registryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects registryizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/registryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('archivizability rollout integration', () => {
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

  it('reports archivizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/archivizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsArchivizabilityRollout: true,
      supportsArchivizabilityAdminTools: true,
      supportsBillingWebhookArchivizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/archivizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns archivizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/archivizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        archivizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects archivizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/archivizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('curatizability rollout integration', () => {
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

  it('reports curatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/curatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCuratizabilityRollout: true,
      supportsCuratizabilityAdminTools: true,
      supportsMeterUsageCuratizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/curatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns curatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/curatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        curatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects curatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/curatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('collectizability rollout integration', () => {
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

  it('reports collectizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/collectizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCollectizabilityRollout: true,
      supportsCollectizabilityAdminTools: true,
      supportsWorkspaceLimitCollectizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/collectizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns collectizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/collectizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        collectizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects collectizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/collectizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('aggregatizability rollout integration', () => {
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

  it('reports aggregatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/aggregatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAggregatizabilityRollout: true,
      supportsAggregatizabilityAdminTools: true,
      supportsProviderCredentialAggregatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/aggregatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns aggregatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/aggregatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        aggregatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects aggregatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/aggregatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('compilatizability rollout integration', () => {
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

  it('reports compilatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/compilatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompilatizabilityRollout: true,
      supportsCompilatizabilityAdminTools: true,
      supportsModelHealthCompilatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/compilatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compilatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/compilatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compilatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compilatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/compilatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('bibliographizability rollout integration', () => {
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

  it('reports bibliographizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/bibliographizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBibliographizabilityRollout: true,
      supportsBibliographizabilityAdminTools: true,
      supportsShieldScanBibliographizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/bibliographizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns bibliographizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/bibliographizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        bibliographizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects bibliographizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/bibliographizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('referencizability rollout integration', () => {
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

  it('reports referencizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/referencizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReferencizabilityRollout: true,
      supportsReferencizabilityAdminTools: true,
      supportsIdempotencyKeyReferencizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/referencizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns referencizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/referencizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        referencizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects referencizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/referencizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('documentizability rollout integration', () => {
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

  it('reports documentizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/documentizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDocumentizabilityRollout: true,
      supportsDocumentizabilityAdminTools: true,
      supportsMembershipDocumentizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/documentizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns documentizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/documentizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        documentizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects documentizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/documentizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('annotationizability rollout integration', () => {
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

  it('reports annotationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/annotationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAnnotationizabilityRollout: true,
      supportsAnnotationizabilityAdminTools: true,
      supportsBillingInvoiceAnnotationizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/annotationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns annotationizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/annotationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        annotationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects annotationizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/annotationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('citationizability rollout integration', () => {
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

  it('reports citationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/citationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCitationizabilityRollout: true,
      supportsCitationizabilityAdminTools: true,
      supportsBillingNotificationCitationizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/citationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns citationizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/citationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        citationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects citationizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/citationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('consolidatizability rollout integration', () => {
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

  it('reports consolidatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/consolidatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConsolidatizabilityRollout: true,
      supportsConsolidatizabilityAdminTools: true,
      supportsBillingWebhookConsolidatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/consolidatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns consolidatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/consolidatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        consolidatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects consolidatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/consolidatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('harmonizability rollout integration', () => {
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

  it('reports harmonizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/harmonizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHarmonizabilityRollout: true,
      supportsHarmonizabilityAdminTools: true,
      supportsMeterUsageHarmonizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/harmonizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns harmonizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/harmonizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        harmonizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects harmonizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/harmonizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('parametrizability rollout integration', () => {
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

  it('reports parametrizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/parametrizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsParametrizabilityRollout: true,
      supportsParametrizabilityAdminTools: true,
      supportsWorkspaceLimitParametrizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/parametrizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns parametrizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/parametrizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        parametrizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects parametrizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/parametrizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('serializability rollout integration', () => {
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

  it('reports serializability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/serializability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSerializabilityRollout: true,
      supportsSerializabilityAdminTools: true,
      supportsProviderCredentialSerializabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/serializability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns serializability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/serializability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        serializabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects serializability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/serializability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('normalizability rollout integration', () => {
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

  it('reports normalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/normalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNormalizabilityRollout: true,
      supportsNormalizabilityAdminTools: true,
      supportsModelHealthNormalizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/normalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns normalizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/normalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        normalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects normalizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/normalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('glossarizability rollout integration', () => {
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

  it('reports glossarizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/glossarizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGlossarizabilityRollout: true,
      supportsGlossarizabilityAdminTools: true,
      supportsShieldScanGlossarizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/glossarizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns glossarizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/glossarizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        glossarizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects glossarizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/glossarizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('thesaurusizability rollout integration', () => {
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

  it('reports thesaurusizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/thesaurusizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsThesaurusizabilityRollout: true,
      supportsThesaurusizabilityAdminTools: true,
      supportsIdempotencyKeyThesaurusizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/thesaurusizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns thesaurusizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/thesaurusizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        thesaurusizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects thesaurusizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/thesaurusizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('terminologizability rollout integration', () => {
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

  it('reports terminologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/terminologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTerminologizabilityRollout: true,
      supportsTerminologizabilityAdminTools: true,
      supportsMembershipTerminologizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/terminologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns terminologizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/terminologizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        terminologizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects terminologizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/terminologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('vocabularizability rollout integration', () => {
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

  it('reports vocabularizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/vocabularizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVocabularizabilityRollout: true,
      supportsVocabularizabilityAdminTools: true,
      supportsBillingInvoiceVocabularizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/vocabularizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns vocabularizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/vocabularizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        vocabularizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects vocabularizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/vocabularizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('footnotizability rollout integration', () => {
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

  it('reports footnotizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/footnotizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFootnotizabilityRollout: true,
      supportsFootnotizabilityAdminTools: true,
      supportsBillingNotificationFootnotizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/footnotizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns footnotizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/footnotizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        footnotizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects footnotizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/footnotizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('contextualizability rollout integration', () => {
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

  it('reports contextualizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/contextualizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsContextualizabilityRollout: true,
      supportsContextualizabilityAdminTools: true,
      supportsBillingWebhookContextualizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/contextualizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns contextualizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/contextualizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        contextualizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects contextualizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/contextualizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('generalizability rollout integration', () => {
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

  it('reports generalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/generalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGeneralizabilityRollout: true,
      supportsGeneralizabilityAdminTools: true,
      supportsMeterUsageGeneralizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/generalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns generalizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/generalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        generalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects generalizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/generalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('standardizability rollout integration', () => {
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

  it('reports standardizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/standardizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStandardizabilityRollout: true,
      supportsStandardizabilityAdminTools: true,
      supportsWorkspaceLimitStandardizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/standardizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns standardizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/standardizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        standardizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects standardizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/standardizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('formalizability rollout integration', () => {
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

  it('reports formalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/formalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFormalizabilityRollout: true,
      supportsFormalizabilityAdminTools: true,
      supportsProviderCredentialFormalizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/formalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns formalizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/formalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        formalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects formalizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/formalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('canonicalizability rollout integration', () => {
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

  it('reports canonicalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/canonicalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCanonicalizabilityRollout: true,
      supportsCanonicalizabilityAdminTools: true,
      supportsModelHealthCanonicalizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/canonicalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns canonicalizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/canonicalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        canonicalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects canonicalizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/canonicalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('abstractizability rollout integration', () => {
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

  it('reports abstractizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/abstractizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAbstractizabilityRollout: true,
      supportsAbstractizabilityAdminTools: true,
      supportsShieldScanAbstractizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/abstractizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns abstractizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/abstractizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        abstractizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects abstractizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/abstractizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('concretizability rollout integration', () => {
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

  it('reports concretizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/concretizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConcretizabilityRollout: true,
      supportsConcretizabilityAdminTools: true,
      supportsIdempotencyKeyConcretizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/concretizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns concretizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/concretizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        concretizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects concretizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/concretizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('definizability rollout integration', () => {
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

  it('reports definizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/definizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDefinizabilityRollout: true,
      supportsDefinizabilityAdminTools: true,
      supportsMembershipDefinizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/definizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns definizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/definizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        definizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects definizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/definizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('inferencizability rollout integration', () => {
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

  it('reports inferencizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/inferencizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInferencizabilityRollout: true,
      supportsInferencizabilityAdminTools: true,
      supportsBillingInvoiceInferencizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/inferencizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inferencizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/inferencizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        inferencizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects inferencizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/inferencizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deducizability rollout integration', () => {
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

  it('reports deducizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/deducizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeducizabilityRollout: true,
      supportsDeducizabilityAdminTools: true,
      supportsBillingNotificationDeducizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/deducizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deducizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/deducizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        deducizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects deducizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/deducizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('probabilizability rollout integration', () => {
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

  it('reports probabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/probabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProbabilizabilityRollout: true,
      supportsProbabilizabilityAdminTools: true,
      supportsBillingWebhookProbabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/probabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns probabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/probabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        probabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects probabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/probabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stochasticizability rollout integration', () => {
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

  it('reports stochasticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/stochasticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStochasticizabilityRollout: true,
      supportsStochasticizabilityAdminTools: true,
      supportsMeterUsageStochasticizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/stochasticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stochasticizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/stochasticizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        stochasticizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects stochasticizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/stochasticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('determinizability rollout integration', () => {
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

  it('reports determinizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/determinizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeterminizabilityRollout: true,
      supportsDeterminizabilityAdminTools: true,
      supportsWorkspaceLimitDeterminizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/determinizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns determinizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/determinizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        determinizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects determinizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/determinizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('predictizability rollout integration', () => {
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

  it('reports predictizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/predictizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPredictizabilityRollout: true,
      supportsPredictizabilityAdminTools: true,
      supportsProviderCredentialPredictizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/predictizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns predictizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/predictizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        predictizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects predictizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/predictizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('extrapolizability rollout integration', () => {
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

  it('reports extrapolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/extrapolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExtrapolizabilityRollout: true,
      supportsExtrapolizabilityAdminTools: true,
      supportsModelHealthExtrapolizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/extrapolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns extrapolizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/extrapolizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        extrapolizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects extrapolizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/extrapolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('inductizability rollout integration', () => {
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

  it('reports inductizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/inductizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInductizabilityRollout: true,
      supportsInductizabilityAdminTools: true,
      supportsShieldScanInductizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/inductizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inductizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/inductizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        inductizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects inductizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/inductizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('abductizability rollout integration', () => {
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

  it('reports abductizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/abductizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAbductizabilityRollout: true,
      supportsAbductizabilityAdminTools: true,
      supportsIdempotencyKeyAbductizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/abductizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns abductizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/abductizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        abductizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects abductizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/abductizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('retrodictizability rollout integration', () => {
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

  it('reports retrodictizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/retrodictizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRetrodictizabilityRollout: true,
      supportsRetrodictizabilityAdminTools: true,
      supportsMembershipRetrodictizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/retrodictizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns retrodictizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/retrodictizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        retrodictizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects retrodictizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/retrodictizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('corroborizability rollout integration', () => {
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

  it('reports corroborizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/corroborizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCorroborizabilityRollout: true,
      supportsCorroborizabilityAdminTools: true,
      supportsBillingInvoiceCorroborizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/corroborizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns corroborizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/corroborizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        corroborizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects corroborizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/corroborizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('falsifiizability rollout integration', () => {
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

  it('reports falsifiizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/falsifiizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFalsifiizabilityRollout: true,
      supportsFalsifiizabilityAdminTools: true,
      supportsBillingNotificationFalsifiizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/falsifiizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns falsifiizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/falsifiizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        falsifiizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects falsifiizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/falsifiizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('interpolizability rollout integration', () => {
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

  it('reports interpolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/interpolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterpolizabilityRollout: true,
      supportsInterpolizabilityAdminTools: true,
      supportsBillingWebhookInterpolizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/interpolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interpolizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/interpolizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        interpolizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects interpolizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/interpolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('regressizability rollout integration', () => {
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

  it('reports regressizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/regressizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegressizabilityRollout: true,
      supportsRegressizabilityAdminTools: true,
      supportsMeterUsageRegressizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/regressizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns regressizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/regressizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        regressizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects regressizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/regressizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('heuristizability rollout integration', () => {
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

  it('reports heuristizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/heuristizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHeuristizabilityRollout: true,
      supportsHeuristizabilityAdminTools: true,
      supportsWorkspaceLimitHeuristizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/heuristizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns heuristizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/heuristizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        heuristizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects heuristizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/heuristizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('simulatizability rollout integration', () => {
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

  it('reports simulatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/simulatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSimulatizabilityRollout: true,
      supportsSimulatizabilityAdminTools: true,
      supportsProviderCredentialSimulatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/simulatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns simulatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/simulatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        simulatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects simulatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/simulatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('optimizability rollout integration', () => {
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

  it('reports optimizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/optimizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOptimizabilityRollout: true,
      supportsOptimizabilityAdminTools: true,
      supportsModelHealthOptimizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/optimizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns optimizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/optimizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        optimizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects optimizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/optimizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('calibratizability rollout integration', () => {
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

  it('reports calibratizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/calibratizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCalibratizabilityRollout: true,
      supportsCalibratizabilityAdminTools: true,
      supportsShieldScanCalibratizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/calibratizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns calibratizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/calibratizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        calibratizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects calibratizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/calibratizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('metricizability rollout integration', () => {
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

  it('reports metricizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/metricizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMetricizabilityRollout: true,
      supportsMetricizabilityAdminTools: true,
      supportsIdempotencyKeyMetricizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/metricizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns metricizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/metricizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        metricizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects metricizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/metricizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('benchmarkizability rollout integration', () => {
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

  it('reports benchmarkizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/benchmarkizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBenchmarkizabilityRollout: true,
      supportsBenchmarkizabilityAdminTools: true,
      supportsMembershipBenchmarkizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/benchmarkizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns benchmarkizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/benchmarkizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        benchmarkizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects benchmarkizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/benchmarkizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('comparizability rollout integration', () => {
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

  it('reports comparizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/comparizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComparizabilityRollout: true,
      supportsComparizabilityAdminTools: true,
      supportsBillingInvoiceComparizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/comparizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns comparizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/comparizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        comparizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects comparizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/comparizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tolerizability rollout integration', () => {
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

  it('reports tolerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/tolerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTolerizabilityRollout: true,
      supportsTolerizabilityAdminTools: true,
      supportsBillingNotificationTolerizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/tolerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tolerizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/tolerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        tolerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects tolerizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/tolerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('approximatizability rollout integration', () => {
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

  it('reports approximatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/approximatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsApproximatizabilityRollout: true,
      supportsApproximatizabilityAdminTools: true,
      supportsBillingWebhookApproximatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/approximatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns approximatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/approximatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        approximatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects approximatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/approximatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('iterativizability rollout integration', () => {
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

  it('reports iterativizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/iterativizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIterativizabilityRollout: true,
      supportsIterativizabilityAdminTools: true,
      supportsMeterUsageIterativizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/iterativizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns iterativizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/iterativizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        iterativizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects iterativizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/iterativizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('convergizability rollout integration', () => {
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

  it('reports convergizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/convergizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConvergizabilityRollout: true,
      supportsConvergizabilityAdminTools: true,
      supportsWorkspaceLimitConvergizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/convergizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns convergizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/convergizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        convergizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects convergizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/convergizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stabilizability rollout integration', () => {
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

  it('reports stabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/stabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStabilizabilityRollout: true,
      supportsStabilizabilityAdminTools: true,
      supportsProviderCredentialStabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/stabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/stabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        stabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects stabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/stabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adaptizability rollout integration', () => {
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

  it('reports adaptizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/adaptizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdaptizabilityRollout: true,
      supportsAdaptizabilityAdminTools: true,
      supportsModelHealthAdaptizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/adaptizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adaptizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/adaptizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        adaptizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects adaptizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/adaptizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('scalabilizability rollout integration', () => {
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

  it('reports scalabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/scalabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScalabilizabilityRollout: true,
      supportsScalabilizabilityAdminTools: true,
      supportsShieldScanScalabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/scalabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scalabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/scalabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        scalabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects scalabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/scalabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('elasticizability rollout integration', () => {
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

  it('reports elasticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/elasticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsElasticizabilityRollout: true,
      supportsElasticizabilityAdminTools: true,
      supportsIdempotencyKeyElasticizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/elasticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns elasticizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/elasticizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        elasticizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects elasticizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/elasticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('resilientizability rollout integration', () => {
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

  it('reports resilientizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/resilientizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResilientizabilityRollout: true,
      supportsResilientizabilityAdminTools: true,
      supportsMembershipResilientizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/resilientizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns resilientizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/resilientizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        resilientizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects resilientizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/resilientizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('robustizability rollout integration', () => {
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

  it('reports robustizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/robustizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRobustizabilityRollout: true,
      supportsRobustizabilityAdminTools: true,
      supportsBillingInvoiceRobustizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/robustizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns robustizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/robustizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        robustizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects robustizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/robustizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dependableizability rollout integration', () => {
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

  it('reports dependableizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/dependableizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDependableizabilityRollout: true,
      supportsDependableizabilityAdminTools: true,
      supportsBillingNotificationDependableizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/dependableizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dependableizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/dependableizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        dependableizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects dependableizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/dependableizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('recoverizability rollout integration', () => {
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

  it('reports recoverizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/recoverizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRecoverizabilityRollout: true,
      supportsRecoverizabilityAdminTools: true,
      supportsBillingWebhookRecoverizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/recoverizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns recoverizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/recoverizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        recoverizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects recoverizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/recoverizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('redundizability rollout integration', () => {
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

  it('reports redundizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/redundizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRedundizabilityRollout: true,
      supportsRedundizabilityAdminTools: true,
      supportsMeterUsageRedundizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/redundizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns redundizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/redundizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        redundizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects redundizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/redundizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('failoverizability rollout integration', () => {
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

  it('reports failoverizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/failoverizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFailoverizabilityRollout: true,
      supportsFailoverizabilityAdminTools: true,
      supportsWorkspaceLimitFailoverizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/failoverizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns failoverizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/failoverizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        failoverizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects failoverizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/failoverizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('continuizability rollout integration', () => {
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

  it('reports continuizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/continuizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsContinuizabilityRollout: true,
      supportsContinuizabilityAdminTools: true,
      supportsProviderCredentialContinuizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/continuizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns continuizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/continuizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        continuizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects continuizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/continuizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('sustainizability rollout integration', () => {
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

  it('reports sustainizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/sustainizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSustainizabilityRollout: true,
      supportsSustainizabilityAdminTools: true,
      supportsModelHealthSustainizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/sustainizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns sustainizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/sustainizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        sustainizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects sustainizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/sustainizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('availabilizability rollout integration', () => {
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

  it('reports availabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/availabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAvailabilizabilityRollout: true,
      supportsAvailabilizabilityAdminTools: true,
      supportsShieldScanAvailabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/availabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns availabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/availabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        availabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects availabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/availabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('traceabilizability rollout integration', () => {
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

  it('reports traceabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/traceabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTraceabilizabilityRollout: true,
      supportsTraceabilizabilityAdminTools: true,
      supportsIdempotencyKeyTraceabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/traceabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns traceabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/traceabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        traceabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects traceabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/traceabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('monitorizability rollout integration', () => {
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

  it('reports monitorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/monitorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMonitorizabilityRollout: true,
      supportsMonitorizabilityAdminTools: true,
      supportsMembershipMonitorizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/monitorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns monitorizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/monitorizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        monitorizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects monitorizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/monitorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('alertabilizability rollout integration', () => {
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

  it('reports alertabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/alertabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAlertabilizabilityRollout: true,
      supportsAlertabilizabilityAdminTools: true,
      supportsBillingInvoiceAlertabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/alertabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns alertabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/alertabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        alertabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects alertabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/alertabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('observabilizability rollout integration', () => {
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

  it('reports observabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/observabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsObservabilizabilityRollout: true,
      supportsObservabilizabilityAdminTools: true,
      supportsBillingNotificationObservabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/observabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns observabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/observabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        observabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects observabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/observabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('restorabilizability rollout integration', () => {
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

  it('reports restorabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/restorabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRestorabilizabilityRollout: true,
      supportsRestorabilizabilityAdminTools: true,
      supportsBillingWebhookRestorabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/restorabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns restorabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/restorabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        restorabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects restorabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/restorabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('replicabilizability rollout integration', () => {
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

  it('reports replicabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/replicabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReplicabilizabilityRollout: true,
      supportsReplicabilizabilityAdminTools: true,
      supportsMeterUsageReplicabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/replicabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns replicabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/replicabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        replicabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects replicabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/replicabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('loadbalancizability rollout integration', () => {
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

  it('reports loadbalancizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/loadbalancizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLoadbalancizabilityRollout: true,
      supportsLoadbalancizabilityAdminTools: true,
      supportsWorkspaceLimitLoadbalancizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/loadbalancizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns loadbalancizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/loadbalancizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        loadbalancizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects loadbalancizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/loadbalancizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('autoscalingizability rollout integration', () => {
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

  it('reports autoscalingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/autoscalingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAutoscalingizabilityRollout: true,
      supportsAutoscalingizabilityAdminTools: true,
      supportsProviderCredentialAutoscalingizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/autoscalingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns autoscalingizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/autoscalingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        autoscalingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects autoscalingizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/autoscalingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deployabilizability rollout integration', () => {
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

  it('reports deployabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/deployabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeployabilizabilityRollout: true,
      supportsDeployabilizabilityAdminTools: true,
      supportsModelHealthDeployabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/deployabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deployabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/deployabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        deployabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects deployabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/deployabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('configurabilizability rollout integration', () => {
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

  it('reports configurabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/configurabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConfigurabilizabilityRollout: true,
      supportsConfigurabilizabilityAdminTools: true,
      supportsShieldScanConfigurabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/configurabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns configurabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/configurabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        configurabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects configurabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/configurabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('operabilizability rollout integration', () => {
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

  it('reports operabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/operabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOperabilizabilityRollout: true,
      supportsOperabilizabilityAdminTools: true,
      supportsIdempotencyKeyOperabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/operabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns operabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/operabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        operabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects operabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/operabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('maintainabilizability rollout integration', () => {
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

  it('reports maintainabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/maintainabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMaintainabilizabilityRollout: true,
      supportsMaintainabilizabilityAdminTools: true,
      supportsMembershipMaintainabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/maintainabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns maintainabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/maintainabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        maintainabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects maintainabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/maintainabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('diagnosabilizability rollout integration', () => {
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

  it('reports diagnosabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/diagnosabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiagnosabilizabilityRollout: true,
      supportsDiagnosabilizabilityAdminTools: true,
      supportsBillingInvoiceDiagnosabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/diagnosabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns diagnosabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/diagnosabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        diagnosabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects diagnosabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/diagnosabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('troubleshootizability rollout integration', () => {
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

  it('reports troubleshootizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/troubleshootizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTroubleshootizabilityRollout: true,
      supportsTroubleshootizabilityAdminTools: true,
      supportsBillingNotificationTroubleshootizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/troubleshootizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns troubleshootizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/troubleshootizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        troubleshootizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects troubleshootizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/troubleshootizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('rollbackabilizability rollout integration', () => {
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

  it('reports rollbackabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/rollbackabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRollbackabilizabilityRollout: true,
      supportsRollbackabilizabilityAdminTools: true,
      supportsBillingWebhookRollbackabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/rollbackabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns rollbackabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/rollbackabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        rollbackabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects rollbackabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/rollbackabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('canaryizability rollout integration', () => {
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

  it('reports canaryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/canaryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCanaryizabilityRollout: true,
      supportsCanaryizabilityAdminTools: true,
      supportsMeterUsageCanaryizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/canaryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns canaryizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/canaryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        canaryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects canaryizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/canaryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('bluegreenizability rollout integration', () => {
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

  it('reports bluegreenizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/bluegreenizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBluegreenizabilityRollout: true,
      supportsBluegreenizabilityAdminTools: true,
      supportsWorkspaceLimitBluegreenizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/bluegreenizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns bluegreenizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/bluegreenizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        bluegreenizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects bluegreenizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/bluegreenizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('progressiveizability rollout integration', () => {
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

  it('reports progressiveizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/progressiveizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProgressiveizabilityRollout: true,
      supportsProgressiveizabilityAdminTools: true,
      supportsProviderCredentialProgressiveizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/progressiveizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns progressiveizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/progressiveizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        progressiveizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects progressiveizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/progressiveizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('featureflagizability rollout integration', () => {
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

  it('reports featureflagizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/featureflagizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFeatureflagizabilityRollout: true,
      supportsFeatureflagizabilityAdminTools: true,
      supportsModelHealthFeatureflagizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/featureflagizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns featureflagizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/featureflagizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        featureflagizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects featureflagizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/featureflagizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('scriptabilizability rollout integration', () => {
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

  it('reports scriptabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/scriptabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScriptabilizabilityRollout: true,
      supportsScriptabilizabilityAdminTools: true,
      supportsShieldScanScriptabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/scriptabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scriptabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/scriptabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        scriptabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects scriptabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/scriptabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('automatizability rollout integration', () => {
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

  it('reports automatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/automatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAutomatizabilityRollout: true,
      supportsAutomatizabilityAdminTools: true,
      supportsIdempotencyKeyAutomatizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/automatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns automatizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/automatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        automatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects automatizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/automatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('orchestrizability rollout integration', () => {
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

  it('reports orchestrizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/orchestrizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrchestrizabilityRollout: true,
      supportsOrchestrizabilityAdminTools: true,
      supportsMembershipOrchestrizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/orchestrizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns orchestrizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/orchestrizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        orchestrizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects orchestrizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/orchestrizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('schedulizability rollout integration', () => {
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

  it('reports schedulizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/schedulizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSchedulizabilityRollout: true,
      supportsSchedulizabilityAdminTools: true,
      supportsBillingInvoiceSchedulizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/schedulizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns schedulizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/schedulizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        schedulizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects schedulizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/schedulizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('triggerizability rollout integration', () => {
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

  it('reports triggerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/triggerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTriggerizabilityRollout: true,
      supportsTriggerizabilityAdminTools: true,
      supportsBillingNotificationTriggerizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/triggerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns triggerizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/triggerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        triggerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects triggerizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/triggerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('releasizability rollout integration', () => {
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

  it('reports releasizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/releasizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReleasizabilityRollout: true,
      supportsReleasizabilityAdminTools: true,
      supportsBillingWebhookReleasizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/releasizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns releasizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/releasizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        releasizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects releasizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/releasizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('versionizability rollout integration', () => {
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

  it('reports versionizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/versionizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVersionizabilityRollout: true,
      supportsVersionizabilityAdminTools: true,
      supportsMeterUsageVersionizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/versionizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns versionizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/versionizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        versionizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects versionizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/versionizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('migratizability rollout integration', () => {
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

  it('reports migratizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/migratizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMigratizabilityRollout: true,
      supportsMigratizabilityAdminTools: true,
      supportsWorkspaceLimitMigratizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/migratizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns migratizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/migratizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        migratizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects migratizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/migratizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('upgradizability rollout integration', () => {
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

  it('reports upgradizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/upgradizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUpgradizabilityRollout: true,
      supportsUpgradizabilityAdminTools: true,
      supportsProviderCredentialUpgradizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/upgradizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns upgradizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/upgradizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        upgradizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects upgradizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/upgradizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('patchizability rollout integration', () => {
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

  it('reports patchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/patchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPatchizabilityRollout: true,
      supportsPatchizabilityAdminTools: true,
      supportsModelHealthPatchizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/patchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns patchizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/patchizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        patchizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects patchizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/patchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('integrabilizability rollout integration', () => {
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

  it('reports integrabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/integrabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrabilizabilityRollout: true,
      supportsIntegrabilizabilityAdminTools: true,
      supportsShieldScanIntegrabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/integrabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/integrabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        integrabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects integrabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/integrabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('composabilizability rollout integration', () => {
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

  it('reports composabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/composabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComposabilizabilityRollout: true,
      supportsComposabilizabilityAdminTools: true,
      supportsIdempotencyKeyComposabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/composabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns composabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/composabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        composabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects composabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/composabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('modularizability rollout integration', () => {
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

  it('reports modularizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/modularizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsModularizabilityRollout: true,
      supportsModularizabilityAdminTools: true,
      supportsMembershipModularizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/modularizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns modularizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/modularizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        modularizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects modularizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/modularizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('extensibilizability rollout integration', () => {
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

  it('reports extensibilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/extensibilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExtensibilizabilityRollout: true,
      supportsExtensibilizabilityAdminTools: true,
      supportsBillingInvoiceExtensibilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/extensibilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns extensibilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/extensibilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        extensibilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects extensibilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/extensibilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('pluggabilizability rollout integration', () => {
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

  it('reports pluggabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/pluggabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPluggabilizabilityRollout: true,
      supportsPluggabilizabilityAdminTools: true,
      supportsBillingNotificationPluggabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/pluggabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns pluggabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/pluggabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        pluggabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects pluggabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/pluggabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('compatibilizability rollout integration', () => {
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

  it('reports compatibilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/compatibilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompatibilizabilityRollout: true,
      supportsCompatibilizabilityAdminTools: true,
      supportsBillingWebhookCompatibilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/compatibilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compatibilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/compatibilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compatibilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compatibilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/compatibilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interoperabilizability rollout integration', () => {
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

  it('reports interoperabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/interoperabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInteroperabilizabilityRollout: true,
      supportsInteroperabilizabilityAdminTools: true,
      supportsMeterUsageInteroperabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/interoperabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interoperabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/interoperabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        interoperabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects interoperabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/interoperabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('connectabilizability rollout integration', () => {
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

  it('reports connectabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/connectabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConnectabilizabilityRollout: true,
      supportsConnectabilizabilityAdminTools: true,
      supportsWorkspaceLimitConnectabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/connectabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns connectabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/connectabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        connectabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects connectabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/connectabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interfabilizability rollout integration', () => {
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

  it('reports interfabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/interfabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterfabilizabilityRollout: true,
      supportsInterfabilizabilityAdminTools: true,
      supportsProviderCredentialInterfabilizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/interfabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interfabilizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/interfabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        interfabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects interfabilizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/interfabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('protocolizability rollout integration', () => {
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

  it('reports protocolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app!.getHttpServer())
      .get('/api/protocolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProtocolizabilityRollout: true,
      supportsProtocolizabilityAdminTools: true,
      supportsModelHealthProtocolizabilitySignals: true,
    })

    const rollout = await request(app!.getHttpServer())
      .get('/api/protocolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns protocolizability admin summary for owners', async () => {
    const response = await request(app!.getHttpServer())
      .get('/api/protocolizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        protocolizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects protocolizability admin tools for members', async () => {
    await request(app!.getHttpServer())
      .get('/api/protocolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
