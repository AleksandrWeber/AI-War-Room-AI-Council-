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
