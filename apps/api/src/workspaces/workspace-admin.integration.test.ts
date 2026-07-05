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
