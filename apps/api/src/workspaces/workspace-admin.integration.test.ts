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
