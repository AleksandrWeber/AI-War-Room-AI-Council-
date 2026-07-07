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

describe('temporal rollout integration', () => {

  it('reports temporal capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/runs/temporal/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTemporalRollout: true,
      temporalEnabled: false,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/runs/temporal/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('disabled')
  })
})

describe('model router rollout integration', () => {

  it('reports model router capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/model-router/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsModelRouterRollout: true,
      supportsModelHealthAdminTools: true,
      llmPrimaryProvider: 'mock',
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/model-router/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns model health admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/model-router/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('requires auth for legacy model recover endpoint', async () => {
    await request(app.getHttpServer())
      .post('/api/model-router/registry/mock-json-v1-primary/recover')
      .expect(401)
  })
})

describe('shield rollout integration', () => {

  it('reports shield capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/shield/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsShieldRollout: true,
      supportsShieldReviewAdminTools: true,
      classifierId: 'deterministic-shield-fallback/v1',
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/shield/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns shield review admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/shield/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })

  it('requires auth for legacy shield review summary endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/shield/review-summary')
      .expect(401)
  })
})

describe('provider credentials rollout integration', () => {

  it('reports provider credentials capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/provider-credentials/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProviderCredentialsRollout: true,
      supportsProviderKeyAdminTools: true,
      managedProviders: ['anthropic', 'openai'],
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/provider-credentials/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns provider key admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/provider-credentials/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('observability rollout integration', () => {

  it('reports observability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/observability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsObservabilityRollout: true,
      supportsObservabilityAdminTools: true,
      structuredLoggingEnabled: true,
      tracingEnabled: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/observability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns observability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/observability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('prompt evaluation rollout integration', () => {

  it('reports prompt evaluation capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/evaluation/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPromptEvaluationRollout: true,
      supportsPromptRegressionAdminTools: true,
      regressionDatasetCaseCount: 6,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/evaluation/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns prompt regression admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/evaluation/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('run history rollout integration', () => {

  it('reports run history capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
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

    const rollout = await request(app.getHttpServer())
      .get('/api/runs/history/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns run history admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/runs/history/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('stream replay rollout integration', () => {

  it('reports stream replay capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
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

    const rollout = await request(app.getHttpServer())
      .get('/api/runs/stream/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stream recovery admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/runs/stream/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('idempotency rollout integration', () => {

  it('reports idempotency capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/idempotency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIdempotencyRollout: true,
      supportsIdempotencyAdminTools: true,
      supportsRedisReservations: true,
      defaultReservationTtlSeconds: 86_400,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/idempotency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns idempotency admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/idempotency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('deployment rollout integration', () => {

  it('reports deployment capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deployment/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeploymentRollout: true,
      supportsDeploymentAdminTools: true,
      supportedDependencies: ['postgres', 'redis'],
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deployment/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deployment admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/deployment/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('migration rollout integration', () => {

  it('reports migration capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/migrations/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMigrationRollout: true,
      supportsMigrationAdminTools: true,
      supportsSchemaMigrationsTable: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/migrations/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns migration admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/migrations/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('backup rollout integration', () => {

  it('reports backup capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/backup/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBackupRollout: true,
      supportsBackupAdminTools: true,
      supportsPostgresBackupCoverage: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/backup/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns backup admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/backup/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('audit trail rollout integration', () => {

  it('reports audit trail capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/audit/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditTrailRollout: true,
      supportsAuditTrailAdminTools: true,
      supportsWorkspaceAuditExport: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/audit/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns audit admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/audit/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('compliance rollout integration', () => {

  it('reports compliance capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compliance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComplianceRollout: true,
      supportsComplianceAdminTools: true,
      supportsPolicyTableCoverage: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compliance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compliance admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/compliance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('incident response rollout integration', () => {

  it('reports incident response capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/incidents/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIncidentResponseRollout: true,
      supportsIncidentAdminTools: true,
      supportsBillingAlertEscalation: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/incidents/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns incident admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/incidents/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('release rollout integration', () => {

  it('reports release capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/releases/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReleaseRollout: true,
      supportsReleaseAdminTools: true,
      supportsApiVersionMetadata: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/releases/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns release admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/releases/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('SLO rollout integration', () => {

  it('reports SLO capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/slo/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSloRollout: true,
      supportsSloAdminTools: true,
      supportsUsageEventSloSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/slo/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns SLO admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/slo/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('capacity rollout integration', () => {

  it('reports capacity capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/capacity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCapacityRollout: true,
      supportsCapacityAdminTools: true,
      supportsUsageLimitsCapacitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/capacity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns capacity admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/capacity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('performance rollout integration', () => {

  it('reports performance capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/performance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPerformanceRollout: true,
      supportsPerformanceAdminTools: true,
      supportsPipelineLatencySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/performance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns performance admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/performance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('resilience rollout integration', () => {

  it('reports resilience capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/resilience/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResilienceRollout: true,
      supportsResilienceAdminTools: true,
      supportsRunWorkflowRecoverySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/resilience/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns resilience admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/resilience/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('availability rollout integration', () => {

  it('reports availability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/availability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAvailabilityRollout: true,
      supportsAvailabilityAdminTools: true,
      supportsRunOutcomeAvailabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/availability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns availability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/availability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('reliability rollout integration', () => {

  it('reports reliability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/reliability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReliabilityRollout: true,
      supportsReliabilityAdminTools: true,
      supportsIdempotencyFaultTolerance: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/reliability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reliability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/reliability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('stability rollout integration', () => {

  it('reports stability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/stability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStabilityRollout: true,
      supportsStabilityAdminTools: true,
      supportsSchemaMigrationStability: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/stability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/stability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('consistency rollout integration', () => {

  it('reports consistency capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/consistency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConsistencyRollout: true,
      supportsConsistencyAdminTools: true,
      supportsIdempotencyConsistencySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/consistency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns consistency admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/consistency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('integrity rollout integration', () => {

  it('reports integrity capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/integrity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrityRollout: true,
      supportsIntegrityAdminTools: true,
      supportsShieldScanIntegritySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/integrity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrity admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/integrity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('durability rollout integration', () => {

  it('reports durability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/durability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDurabilityRollout: true,
      supportsDurabilityAdminTools: true,
      supportsRedisPersistenceSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/durability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns durability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/durability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('recoverability rollout integration', () => {

  it('reports recoverability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/recoverability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRecoverabilityRollout: true,
      supportsRecoverabilityAdminTools: true,
      supportsStreamRecoverySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/recoverability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns recoverability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/recoverability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('maintainability rollout integration', () => {

  it('reports maintainability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/maintainability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMaintainabilityRollout: true,
      supportsMaintainabilityAdminTools: true,
      supportsModelHealthMaintainabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/maintainability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns maintainability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/maintainability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('scalability rollout integration', () => {

  it('reports scalability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/scalability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScalabilityRollout: true,
      supportsScalabilityAdminTools: true,
      supportsUsageLimitScalabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/scalability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scalability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/scalability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('traceability rollout integration', () => {

  it('reports traceability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/traceability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTraceabilityRollout: true,
      supportsTraceabilityAdminTools: true,
      supportsArtifactLineageSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/traceability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns traceability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/traceability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('efficiency rollout integration', () => {

  it('reports efficiency capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/efficiency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEfficiencyRollout: true,
      supportsEfficiencyAdminTools: true,
      supportsCostLimitEfficiencySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/efficiency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns efficiency admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/efficiency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('optimization rollout integration', () => {

  it('reports optimization capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/optimization/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOptimizationRollout: true,
      supportsOptimizationAdminTools: true,
      supportsModelHealthOptimizationSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/optimization/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns optimization admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/optimization/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('utilization rollout integration', () => {

  it('reports utilization capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/utilization/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUtilizationRollout: true,
      supportsUtilizationAdminTools: true,
      supportsMembershipUtilizationSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/utilization/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns utilization admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/utilization/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('sustainability rollout integration', () => {

  it('reports sustainability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/sustainability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSustainabilityRollout: true,
      supportsSustainabilityAdminTools: true,
      supportsBillingSustainabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/sustainability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns sustainability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/sustainability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('governance rollout integration', () => {

  it('reports governance capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/governance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGovernanceRollout: true,
      supportsGovernanceAdminTools: true,
      supportsAccessGovernanceSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/governance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns governance admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/governance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('oversight rollout integration', () => {

  it('reports oversight capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/oversight/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOversightRollout: true,
      supportsOversightAdminTools: true,
      supportsBillingOversightSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/oversight/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns oversight admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/oversight/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('assurance rollout integration', () => {

  it('reports assurance capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/assurance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssuranceRollout: true,
      supportsAssuranceAdminTools: true,
      supportsShieldQualityAssuranceSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/assurance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assurance admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/assurance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('accountability rollout integration', () => {

  it('reports accountability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/accountability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAccountabilityRollout: true,
      supportsAccountabilityAdminTools: true,
      supportsIdempotencyAccountabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/accountability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns accountability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/accountability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})

describe('transparency rollout integration', () => {

  it('reports transparency capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/transparency/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTransparencyRollout: true,
      supportsTransparencyAdminTools: true,
      supportsWorkflowTransparencySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/transparency/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns transparency admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/transparency/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('attestation rollout integration', () => {

  it('reports attestation capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attestation/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttestationRollout: true,
      supportsAttestationAdminTools: true,
      supportsModelRegistryAttestationSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attestation/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attestation admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/attestation/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('authenticity rollout integration', () => {

  it('reports authenticity capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/authenticity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuthenticityRollout: true,
      supportsAuthenticityAdminTools: true,
      supportsSynthesisAuthenticitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/authenticity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns authenticity admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/authenticity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('provenance rollout integration', () => {

  it('reports provenance capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/provenance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProvenanceRollout: true,
      supportsProvenanceAdminTools: true,
      supportsUsageProvenanceSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/provenance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns provenance admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/provenance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('verifiability rollout integration', () => {

  it('reports verifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/verifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVerifiabilityRollout: true,
      supportsVerifiabilityAdminTools: true,
      supportsBillingInvoiceVerifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/verifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns verifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/verifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('confirmability rollout integration', () => {

  it('reports confirmability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/confirmability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConfirmabilityRollout: true,
      supportsConfirmabilityAdminTools: true,
      supportsBillingNotificationConfirmabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/confirmability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns confirmability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/confirmability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('validity rollout integration', () => {

  it('reports validity capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/validity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsValidityRollout: true,
      supportsValidityAdminTools: true,
      supportsAgentOutputValiditySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/validity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns validity admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/validity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('credibility rollout integration', () => {

  it('reports credibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/credibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCredibilityRollout: true,
      supportsCredibilityAdminTools: true,
      supportsBillingInvoiceCredibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/credibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns credibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/credibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reproducibility rollout integration', () => {

  it('reports reproducibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/reproducibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReproducibilityRollout: true,
      supportsReproducibilityAdminTools: true,
      supportsIdempotencyReproducibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/reproducibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reproducibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/reproducibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('defensibility rollout integration', () => {

  it('reports defensibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/defensibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDefensibilityRollout: true,
      supportsDefensibilityAdminTools: true,
      supportsShieldReviewDefensibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/defensibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns defensibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/defensibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('auditability rollout integration', () => {

  it('reports auditability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditabilityRollout: true,
      supportsAuditabilityAdminTools: true,
      supportsUsageAuditabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/auditability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('inspectability rollout integration', () => {

  it('reports inspectability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/inspectability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInspectabilityRollout: true,
      supportsInspectabilityAdminTools: true,
      supportsUsageInspectabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/inspectability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inspectability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/inspectability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('explainability rollout integration', () => {

  it('reports explainability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/explainability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExplainabilityRollout: true,
      supportsExplainabilityAdminTools: true,
      supportsSynthesisExplainabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/explainability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns explainability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/explainability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('demonstrability rollout integration', () => {

  it('reports demonstrability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/demonstrability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDemonstrabilityRollout: true,
      supportsDemonstrabilityAdminTools: true,
      supportsWorkflowDemonstrabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/demonstrability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns demonstrability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/demonstrability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('justifiability rollout integration', () => {

  it('reports justifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/justifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsJustifiabilityRollout: true,
      supportsJustifiabilityAdminTools: true,
      supportsShieldReviewJustifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/justifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns justifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/justifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reviewability rollout integration', () => {

  it('reports reviewability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/reviewability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReviewabilityRollout: true,
      supportsReviewabilityAdminTools: true,
      supportsArtifactReviewabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/reviewability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reviewability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/reviewability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('assessability rollout integration', () => {

  it('reports assessability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/assessability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssessabilityRollout: true,
      supportsAssessabilityAdminTools: true,
      supportsModelHealthAssessabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/assessability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assessability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/assessability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('measurability rollout integration', () => {

  it('reports measurability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/measurability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMeasurabilityRollout: true,
      supportsMeasurabilityAdminTools: true,
      supportsMeterUsageMeasurabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/measurability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns measurability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/measurability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('certifiability rollout integration', () => {

  it('reports certifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/certifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCertifiabilityRollout: true,
      supportsCertifiabilityAdminTools: true,
      supportsProviderCredentialCertifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/certifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns certifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/certifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('substantiability rollout integration', () => {

  it('reports substantiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/substantiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSubstantiabilityRollout: true,
      supportsSubstantiabilityAdminTools: true,
      supportsBillingRecordSubstantiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/substantiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns substantiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/substantiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('warrantability rollout integration', () => {

  it('reports warrantability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/warrantability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWarrantabilityRollout: true,
      supportsWarrantabilityAdminTools: true,
      supportsShieldScanWarrantabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/warrantability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns warrantability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/warrantability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('attributability rollout integration', () => {

  it('reports attributability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attributability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttributabilityRollout: true,
      supportsAttributabilityAdminTools: true,
      supportsAgentOutputAttributabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attributability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attributability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/attributability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('identifiability rollout integration', () => {

  it('reports identifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/identifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIdentifiabilityRollout: true,
      supportsIdentifiabilityAdminTools: true,
      supportsIdempotencyKeyIdentifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/identifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns identifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/identifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('comparability rollout integration', () => {

  it('reports comparability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/comparability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComparabilityRollout: true,
      supportsComparabilityAdminTools: true,
      supportsBillingInvoiceComparabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/comparability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns comparability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/comparability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('distinguishability rollout integration', () => {

  it('reports distinguishability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/distinguishability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDistinguishabilityRollout: true,
      supportsDistinguishabilityAdminTools: true,
      supportsSynthesisDistinguishabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/distinguishability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns distinguishability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/distinguishability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('assignability rollout integration', () => {

  it('reports assignability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/assignability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssignabilityRollout: true,
      supportsAssignabilityAdminTools: true,
      supportsWorkspaceMembershipAssignabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/assignability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assignability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/assignability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('referencability rollout integration', () => {

  it('reports referencability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/referencability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReferencabilityRollout: true,
      supportsReferencabilityAdminTools: true,
      supportsArtifactReferencabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/referencability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns referencability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/referencability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('locatability rollout integration', () => {

  it('reports locatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/locatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLocatabilityRollout: true,
      supportsLocatabilityAdminTools: true,
      supportsProviderCredentialLocatabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/locatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns locatability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/locatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('retrievability rollout integration', () => {

  it('reports retrievability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/retrievability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRetrievabilityRollout: true,
      supportsRetrievabilityAdminTools: true,
      supportsShieldScanRetrievabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/retrievability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns retrievability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/retrievability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('discoverability rollout integration', () => {

  it('reports discoverability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/discoverability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiscoverabilityRollout: true,
      supportsDiscoverabilityAdminTools: true,
      supportsMeterUsageDiscoverabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/discoverability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns discoverability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/discoverability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('navigability rollout integration', () => {

  it('reports navigability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/navigability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNavigabilityRollout: true,
      supportsNavigabilityAdminTools: true,
      supportsWorkflowNavigabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/navigability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns navigability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/navigability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('connectability rollout integration', () => {

  it('reports connectability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/connectability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConnectabilityRollout: true,
      supportsConnectabilityAdminTools: true,
      supportsUsageEventConnectabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/connectability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns connectability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/connectability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('linkability rollout integration', () => {

  it('reports linkability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/linkability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLinkabilityRollout: true,
      supportsLinkabilityAdminTools: true,
      supportsWorkflowLinkabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/linkability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns linkability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/linkability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interchangeability rollout integration', () => {

  it('reports interchangeability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/interchangeability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterchangeabilityRollout: true,
      supportsInterchangeabilityAdminTools: true,
      supportsMeterUsageInterchangeabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/interchangeability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interchangeability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/interchangeability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('transferability rollout integration', () => {

  it('reports transferability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/transferability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTransferabilityRollout: true,
      supportsTransferabilityAdminTools: true,
      supportsBillingRecordTransferabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/transferability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns transferability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/transferability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('portability rollout integration', () => {

  it('reports portability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/portability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPortabilityRollout: true,
      supportsPortabilityAdminTools: true,
      supportsArtifactPortabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/portability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns portability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/portability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('compatibility rollout integration', () => {

  it('reports compatibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compatibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompatibilityRollout: true,
      supportsCompatibilityAdminTools: true,
      supportsProviderCredentialCompatibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compatibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compatibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/compatibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adaptability rollout integration', () => {

  it('reports adaptability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/adaptability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdaptabilityRollout: true,
      supportsAdaptabilityAdminTools: true,
      supportsBillingWebhookAdaptabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/adaptability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adaptability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/adaptability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('flexibility rollout integration', () => {

  it('reports flexibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/flexibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFlexibilityRollout: true,
      supportsFlexibilityAdminTools: true,
      supportsWorkflowFlexibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/flexibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns flexibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/flexibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('extensibility rollout integration', () => {

  it('reports extensibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/extensibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExtensibilityRollout: true,
      supportsExtensibilityAdminTools: true,
      supportsAgentOutputExtensibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/extensibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns extensibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/extensibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('modifiability rollout integration', () => {

  it('reports modifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/modifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsModifiabilityRollout: true,
      supportsModifiabilityAdminTools: true,
      supportsIdempotencyKeyModifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/modifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns modifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/modifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('configurability rollout integration', () => {

  it('reports configurability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/configurability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConfigurabilityRollout: true,
      supportsConfigurabilityAdminTools: true,
      supportsProviderCredentialConfigurabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/configurability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns configurability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/configurability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('customizability rollout integration', () => {

  it('reports customizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/customizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCustomizabilityRollout: true,
      supportsCustomizabilityAdminTools: true,
      supportsWorkflowCustomizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/customizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns customizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/customizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('operability rollout integration', () => {

  it('reports operability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/operability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOperabilityRollout: true,
      supportsOperabilityAdminTools: true,
      supportsBillingNotificationOperabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/operability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns operability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/operability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tunability rollout integration', () => {

  it('reports tunability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/tunability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTunabilityRollout: true,
      supportsTunabilityAdminTools: true,
      supportsUsageEventTunabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/tunability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tunability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/tunability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adjustability rollout integration', () => {

  it('reports adjustability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/adjustability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdjustabilityRollout: true,
      supportsAdjustabilityAdminTools: true,
      supportsBillingInvoiceAdjustabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/adjustability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adjustability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/adjustability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('programmability rollout integration', () => {

  it('reports programmability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/programmability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProgrammabilityRollout: true,
      supportsProgrammabilityAdminTools: true,
      supportsWorkflowProgrammabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/programmability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns programmability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/programmability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deployability rollout integration', () => {

  it('reports deployability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deployability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeployabilityRollout: true,
      supportsDeployabilityAdminTools: true,
      supportsProviderCredentialDeployabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deployability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deployability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/deployability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('manageability rollout integration', () => {

  it('reports manageability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/manageability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsManageabilityRollout: true,
      supportsManageabilityAdminTools: true,
      supportsBillingNotificationManageabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/manageability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns manageability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/manageability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('controllability rollout integration', () => {

  it('reports controllability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/controllability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsControllabilityRollout: true,
      supportsControllabilityAdminTools: true,
      supportsIdempotencyKeyControllabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/controllability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns controllability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/controllability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('integrability rollout integration', () => {

  it('reports integrability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/integrability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrabilityRollout: true,
      supportsIntegrabilityAdminTools: true,
      supportsBillingWebhookIntegrabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/integrability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/integrability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('orchestrability rollout integration', () => {

  it('reports orchestrability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/orchestrability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrchestrabilityRollout: true,
      supportsOrchestrabilityAdminTools: true,
      supportsWorkflowOrchestrabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/orchestrability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns orchestrability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/orchestrability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('schedulability rollout integration', () => {

  it('reports schedulability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/schedulability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSchedulabilityRollout: true,
      supportsSchedulabilityAdminTools: true,
      supportsMeterUsageSchedulabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/schedulability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns schedulability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/schedulability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('automatability rollout integration', () => {

  it('reports automatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/automatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAutomatabilityRollout: true,
      supportsAutomatabilityAdminTools: true,
      supportsAgentOutputAutomatabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/automatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns automatability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/automatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('monitorability rollout integration', () => {

  it('reports monitorability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/monitorability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMonitorabilityRollout: true,
      supportsMonitorabilityAdminTools: true,
      supportsUsageEventMonitorabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/monitorability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns monitorability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/monitorability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('predictability rollout integration', () => {

  it('reports predictability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/predictability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPredictabilityRollout: true,
      supportsPredictabilityAdminTools: true,
      supportsSynthesisPredictabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/predictability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns predictability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/predictability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('repeatability rollout integration', () => {

  it('reports repeatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/repeatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRepeatabilityRollout: true,
      supportsRepeatabilityAdminTools: true,
      supportsArtifactRepeatabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/repeatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns repeatability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/repeatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('responsiveness rollout integration', () => {

  it('reports responsiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/responsiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResponsivenessRollout: true,
      supportsResponsivenessAdminTools: true,
      supportsUsageEventResponsivenessSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/responsiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns responsiveness admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/responsiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dependability rollout integration', () => {

  it('reports dependability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/dependability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDependabilityRollout: true,
      supportsDependabilityAdminTools: true,
      supportsBillingRecordDependabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/dependability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dependability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/dependability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('composability rollout integration', () => {

  it('reports composability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/composability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComposabilityRollout: true,
      supportsComposabilityAdminTools: true,
      supportsWorkflowComposabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/composability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns composability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/composability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('trustworthiness rollout integration', () => {

  it('reports trustworthiness capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/trustworthiness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTrustworthinessRollout: true,
      supportsTrustworthinessAdminTools: true,
      supportsShieldScanTrustworthinessSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/trustworthiness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns trustworthiness admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/trustworthiness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('usability rollout integration', () => {

  it('reports usability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/usability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUsabilityRollout: true,
      supportsUsabilityAdminTools: true,
      supportsMembershipUsabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/usability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns usability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/usability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('accessibility rollout integration', () => {

  it('reports accessibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/accessibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAccessibilityRollout: true,
      supportsAccessibilityAdminTools: true,
      supportsIdempotencyKeyAccessibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/accessibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns accessibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/accessibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('effectiveness rollout integration', () => {

  it('reports effectiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/effectiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEffectivenessRollout: true,
      supportsEffectivenessAdminTools: true,
      supportsAgentOutputEffectivenessSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/effectiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns effectiveness admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/effectiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('appropriateness rollout integration', () => {

  it('reports appropriateness capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/appropriateness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAppropriatenessRollout: true,
      supportsAppropriatenessAdminTools: true,
      supportsBillingInvoiceAppropriatenessSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/appropriateness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns appropriateness admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/appropriateness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('survivability rollout integration', () => {

  it('reports survivability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/survivability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSurvivabilityRollout: true,
      supportsSurvivabilityAdminTools: true,
      supportsBillingRecordSurvivabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/survivability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns survivability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/survivability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('viability rollout integration', () => {

  it('reports viability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/viability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsViabilityRollout: true,
      supportsViabilityAdminTools: true,
      supportsBillingInvoiceViabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/viability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns viability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/viability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('feasibility rollout integration', () => {

  it('reports feasibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/feasibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFeasibilityRollout: true,
      supportsFeasibilityAdminTools: true,
      supportsProviderCredentialFeasibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/feasibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns feasibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/feasibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('conformance rollout integration', () => {

  it('reports conformance capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/conformance/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConformanceRollout: true,
      supportsConformanceAdminTools: true,
      supportsShieldScanConformanceSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/conformance/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns conformance admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/conformance/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adoptability rollout integration', () => {

  it('reports adoptability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/adoptability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdoptabilityRollout: true,
      supportsAdoptabilityAdminTools: true,
      supportsUsageEventAdoptabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/adoptability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adoptability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/adoptability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('acceptability rollout integration', () => {

  it('reports acceptability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/acceptability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAcceptabilityRollout: true,
      supportsAcceptabilityAdminTools: true,
      supportsBillingRecordAcceptabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/acceptability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns acceptability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/acceptability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('affordability rollout integration', () => {

  it('reports affordability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/affordability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAffordabilityRollout: true,
      supportsAffordabilityAdminTools: true,
      supportsBillingInvoiceAffordabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/affordability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns affordability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/affordability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('desirability rollout integration', () => {

  it('reports desirability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/desirability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDesirabilityRollout: true,
      supportsDesirabilityAdminTools: true,
      supportsUsageEventDesirabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/desirability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns desirability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/desirability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('marketability rollout integration', () => {

  it('reports marketability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/marketability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMarketabilityRollout: true,
      supportsMarketabilityAdminTools: true,
      supportsMembershipMarketabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/marketability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns marketability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/marketability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('suitability rollout integration', () => {

  it('reports suitability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/suitability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSuitabilityRollout: true,
      supportsSuitabilityAdminTools: true,
      supportsAgentOutputSuitabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/suitability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns suitability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/suitability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('profitability rollout integration', () => {

  it('reports profitability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/profitability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProfitabilityRollout: true,
      supportsProfitabilityAdminTools: true,
      supportsBillingRecordProfitabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/profitability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns profitability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/profitability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('learnability rollout integration', () => {

  it('reports learnability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/learnability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLearnabilityRollout: true,
      supportsLearnabilityAdminTools: true,
      supportsAgentOutputLearnabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/learnability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns learnability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/learnability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deliverability rollout integration', () => {

  it('reports deliverability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deliverability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeliverabilityRollout: true,
      supportsDeliverabilityAdminTools: true,
      supportsBillingNotificationDeliverabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deliverability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deliverability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/deliverability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('understandability rollout integration', () => {

  it('reports understandability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/understandability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUnderstandabilityRollout: true,
      supportsUnderstandabilityAdminTools: true,
      supportsSynthesisUnderstandabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/understandability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns understandability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/understandability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('memorability rollout integration', () => {

  it('reports memorability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/memorability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMemorabilityRollout: true,
      supportsMemorabilityAdminTools: true,
      supportsArtifactMemorabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/memorability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns memorability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/memorability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('teachability rollout integration', () => {

  it('reports teachability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/teachability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTeachabilityRollout: true,
      supportsTeachabilityAdminTools: true,
      supportsWorkflowTeachabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/teachability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns teachability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/teachability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('readability rollout integration', () => {

  it('reports readability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/readability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReadabilityRollout: true,
      supportsReadabilityAdminTools: true,
      supportsArtifactReadabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/readability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns readability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/readability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('clarity rollout integration', () => {

  it('reports clarity capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/clarity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsClarityRollout: true,
      supportsClarityAdminTools: true,
      supportsSynthesisClaritySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/clarity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns clarity admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/clarity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('simplicity rollout integration', () => {

  it('reports simplicity capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/simplicity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSimplicityRollout: true,
      supportsSimplicityAdminTools: true,
      supportsWorkflowSimplicitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/simplicity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns simplicity admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/simplicity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('negotiability rollout integration', () => {

  it('reports negotiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/negotiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNegotiabilityRollout: true,
      supportsNegotiabilityAdminTools: true,
      supportsBillingInvoiceNegotiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/negotiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns negotiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/negotiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('comprehensibility rollout integration', () => {

  it('reports comprehensibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/comprehensibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComprehensibilityRollout: true,
      supportsComprehensibilityAdminTools: true,
      supportsAgentOutputComprehensibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/comprehensibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns comprehensibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/comprehensibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('intelligibility rollout integration', () => {

  it('reports intelligibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/intelligibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntelligibilityRollout: true,
      supportsIntelligibilityAdminTools: true,
      supportsSynthesisIntelligibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/intelligibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns intelligibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/intelligibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('legibility rollout integration', () => {

  it('reports legibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/legibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLegibilityRollout: true,
      supportsLegibilityAdminTools: true,
      supportsArtifactLegibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/legibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns legibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/legibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('parsability rollout integration', () => {

  it('reports parsability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/parsability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsParsabilityRollout: true,
      supportsParsabilityAdminTools: true,
      supportsIdempotencyKeyParsabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/parsability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns parsability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/parsability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('coherence rollout integration', () => {

  it('reports coherence capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/coherence/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCoherenceRollout: true,
      supportsCoherenceAdminTools: true,
      supportsWorkflowCoherenceSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/coherence/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns coherence admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/coherence/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('familiarity rollout integration', () => {

  it('reports familiarity capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/familiarity/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFamiliarityRollout: true,
      supportsFamiliarityAdminTools: true,
      supportsMembershipFamiliaritySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/familiarity/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns familiarity admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/familiarity/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('recognizability rollout integration', () => {

  it('reports recognizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/recognizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRecognizabilityRollout: true,
      supportsRecognizabilityAdminTools: true,
      supportsArtifactRecognizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/recognizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns recognizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/recognizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interpretability rollout integration', () => {

  it('reports interpretability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/interpretability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterpretabilityRollout: true,
      supportsInterpretabilityAdminTools: true,
      supportsAgentOutputInterpretabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/interpretability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interpretability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/interpretability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('scannability rollout integration', () => {

  it('reports scannability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/scannability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScannabilityRollout: true,
      supportsScannabilityAdminTools: true,
      supportsShieldScanScannabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/scannability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scannability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/scannability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('perceptibility rollout integration', () => {

  it('reports perceptibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/perceptibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPerceptibilityRollout: true,
      supportsPerceptibilityAdminTools: true,
      supportsUsageEventPerceptibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/perceptibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns perceptibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/perceptibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('noticeability rollout integration', () => {

  it('reports noticeability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/noticeability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNoticeabilityRollout: true,
      supportsNoticeabilityAdminTools: true,
      supportsBillingNotificationNoticeabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/noticeability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns noticeability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/noticeability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('discernibility rollout integration', () => {

  it('reports discernibility capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/discernibility/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiscernibilityRollout: true,
      supportsDiscernibilityAdminTools: true,
      supportsSynthesisDiscernibilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/discernibility/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns discernibility admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/discernibility/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('distinctiveness rollout integration', () => {

  it('reports distinctiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/distinctiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDistinctivenessRollout: true,
      supportsDistinctivenessAdminTools: true,
      supportsIdempotencyKeyDistinctivenessSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/distinctiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns distinctiveness admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/distinctiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('conspicuousness rollout integration', () => {

  it('reports conspicuousness capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/conspicuousness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConspicuousnessRollout: true,
      supportsConspicuousnessAdminTools: true,
      supportsMembershipConspicuousnessSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/conspicuousness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns conspicuousness admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/conspicuousness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('detectability rollout integration', () => {

  it('reports detectability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/detectability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDetectabilityRollout: true,
      supportsDetectabilityAdminTools: true,
      supportsBillingWebhookDetectabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/detectability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns detectability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/detectability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('describability rollout integration', () => {

  it('reports describability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/describability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDescribabilityRollout: true,
      supportsDescribabilityAdminTools: true,
      supportsWorkflowDescribabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/describability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns describability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/describability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('expressiveness rollout integration', () => {

  it('reports expressiveness capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/expressiveness/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExpressivenessRollout: true,
      supportsExpressivenessAdminTools: true,
      supportsAgentOutputExpressivenessSignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/expressiveness/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns expressiveness admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/expressiveness/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('communicability rollout integration', () => {

  it('reports communicability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/communicability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCommunicabilityRollout: true,
      supportsCommunicabilityAdminTools: true,
      supportsSynthesisCommunicabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/communicability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns communicability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/communicability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('articulability rollout integration', () => {

  it('reports articulability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/articulability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsArticulabilityRollout: true,
      supportsArticulabilityAdminTools: true,
      supportsArtifactArticulabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/articulability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns articulability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/articulability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('elaboratability rollout integration', () => {

  it('reports elaboratability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/elaboratability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsElaboratabilityRollout: true,
      supportsElaboratabilityAdminTools: true,
      supportsWorkflowElaboratabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/elaboratability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns elaboratability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/elaboratability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('representability rollout integration', () => {

  it('reports representability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/representability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRepresentabilityRollout: true,
      supportsRepresentabilityAdminTools: true,
      supportsBillingInvoiceRepresentabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/representability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns representability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/representability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('presentability rollout integration', () => {

  it('reports presentability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/presentability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPresentabilityRollout: true,
      supportsPresentabilityAdminTools: true,
      supportsUsageEventPresentabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/presentability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns presentability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/presentability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('enunciability rollout integration', () => {

  it('reports enunciability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/enunciability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEnunciabilityRollout: true,
      supportsEnunciabilityAdminTools: true,
      supportsBillingNotificationEnunciabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/enunciability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns enunciability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/enunciability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('formulatability rollout integration', () => {

  it('reports formulatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/formulatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFormulatabilityRollout: true,
      supportsFormulatabilityAdminTools: true,
      supportsIdempotencyKeyFormulatabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/formulatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns formulatability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/formulatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('narratability rollout integration', () => {

  it('reports narratability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/narratability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNarratabilityRollout: true,
      supportsNarratabilityAdminTools: true,
      supportsMembershipNarratabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/narratability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns narratability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/narratability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('illustratability rollout integration', () => {

  it('reports illustratability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/illustratability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIllustratabilityRollout: true,
      supportsIllustratabilityAdminTools: true,
      supportsShieldScanIllustratabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/illustratability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns illustratability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/illustratability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('symbolizability rollout integration', () => {

  it('reports symbolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/symbolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSymbolizabilityRollout: true,
      supportsSymbolizabilityAdminTools: true,
      supportsBillingRecordSymbolizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/symbolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns symbolizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/symbolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('visualizability rollout integration', () => {

  it('reports visualizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/visualizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVisualizabilityRollout: true,
      supportsVisualizabilityAdminTools: true,
      supportsModelRegistryVisualizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/visualizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns visualizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/visualizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('evocatability rollout integration', () => {

  it('reports evocatability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/evocatability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEvocatabilityRollout: true,
      supportsEvocatabilityAdminTools: true,
      supportsModelHealthEvocatabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/evocatability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns evocatability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/evocatability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('signifiability rollout integration', () => {

  it('reports signifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/signifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSignifiabilityRollout: true,
      supportsSignifiabilityAdminTools: true,
      supportsBillingWebhookSignifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/signifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns signifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/signifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('connotability rollout integration', () => {

  it('reports connotability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/connotability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConnotabilityRollout: true,
      supportsConnotabilityAdminTools: true,
      supportsMeterUsageConnotabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/connotability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns connotability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/connotability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('typifiability rollout integration', () => {

  it('reports typifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/typifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTypifiabilityRollout: true,
      supportsTypifiabilityAdminTools: true,
      supportsWorkspaceLimitTypifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/typifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns typifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/typifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('metaphorizability rollout integration', () => {

  it('reports metaphorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/metaphorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMetaphorizabilityRollout: true,
      supportsMetaphorizabilityAdminTools: true,
      supportsProviderCredentialMetaphorizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/metaphorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns metaphorizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/metaphorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dramatizability rollout integration', () => {

  it('reports dramatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/dramatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDramatizabilityRollout: true,
      supportsDramatizabilityAdminTools: true,
      supportsArtifactDramatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/dramatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dramatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/dramatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('personifiability rollout integration', () => {

  it('reports personifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/personifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPersonifiabilityRollout: true,
      supportsPersonifiabilityAdminTools: true,
      supportsAgentOutputPersonifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/personifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns personifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/personifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('materializability rollout integration', () => {

  it('reports materializability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/materializability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMaterializabilityRollout: true,
      supportsMaterializabilityAdminTools: true,
      supportsWorkflowMaterializabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/materializability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns materializability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/materializability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('iconizability rollout integration', () => {

  it('reports iconizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/iconizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIconizabilityRollout: true,
      supportsIconizabilityAdminTools: true,
      supportsShieldScanIconizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/iconizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns iconizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/iconizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('allegorizability rollout integration', () => {

  it('reports allegorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/allegorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAllegorizabilityRollout: true,
      supportsAllegorizabilityAdminTools: true,
      supportsIdempotencyKeyAllegorizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/allegorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns allegorizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/allegorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tokenizability rollout integration', () => {

  it('reports tokenizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/tokenizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTokenizabilityRollout: true,
      supportsTokenizabilityAdminTools: true,
      supportsMembershipTokenizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/tokenizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tokenizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/tokenizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stylizability rollout integration', () => {

  it('reports stylizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/stylizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStylizabilityRollout: true,
      supportsStylizabilityAdminTools: true,
      supportsBillingInvoiceStylizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/stylizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stylizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/stylizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('emblemizability rollout integration', () => {

  it('reports emblemizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/emblemizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEmblemizabilityRollout: true,
      supportsEmblemizabilityAdminTools: true,
      supportsBillingNotificationEmblemizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/emblemizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns emblemizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/emblemizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('analogizability rollout integration', () => {

  it('reports analogizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/analogizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAnalogizabilityRollout: true,
      supportsAnalogizabilityAdminTools: true,
      supportsUsageEventAnalogizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/analogizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns analogizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/analogizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('parabolizability rollout integration', () => {

  it('reports parabolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/parabolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsParabolizabilityRollout: true,
      supportsParabolizabilityAdminTools: true,
      supportsSynthesisParabolizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/parabolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns parabolizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/parabolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('archetypizability rollout integration', () => {

  it('reports archetypizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/archetypizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsArchetypizabilityRollout: true,
      supportsArchetypizabilityAdminTools: true,
      supportsBillingRecordArchetypizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/archetypizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns archetypizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/archetypizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('caracterizability rollout integration', () => {

  it('reports caracterizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/caracterizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCaracterizabilityRollout: true,
      supportsCaracterizabilityAdminTools: true,
      supportsWorkflowCaracterizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/caracterizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns caracterizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/caracterizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('mythicizability rollout integration', () => {

  it('reports mythicizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/mythicizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMythicizabilityRollout: true,
      supportsMythicizabilityAdminTools: true,
      supportsArtifactMythicizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/mythicizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns mythicizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/mythicizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('semiotizability rollout integration', () => {

  it('reports semiotizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/semiotizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSemiotizabilityRollout: true,
      supportsSemiotizabilityAdminTools: true,
      supportsShieldScanSemiotizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/semiotizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns semiotizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/semiotizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('hermeneutizability rollout integration', () => {

  it('reports hermeneutizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/hermeneutizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHermeneutizabilityRollout: true,
      supportsHermeneutizabilityAdminTools: true,
      supportsIdempotencyKeyHermeneutizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/hermeneutizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hermeneutizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/hermeneutizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('lexicalizability rollout integration', () => {

  it('reports lexicalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/lexicalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLexicalizabilityRollout: true,
      supportsLexicalizabilityAdminTools: true,
      supportsMembershipLexicalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/lexicalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns lexicalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/lexicalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('semanticizability rollout integration', () => {

  it('reports semanticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/semanticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSemanticizabilityRollout: true,
      supportsSemanticizabilityAdminTools: true,
      supportsBillingInvoiceSemanticizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/semanticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns semanticizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/semanticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('pragmatizability rollout integration', () => {

  it('reports pragmatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/pragmatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPragmatizabilityRollout: true,
      supportsPragmatizabilityAdminTools: true,
      supportsBillingNotificationPragmatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/pragmatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns pragmatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/pragmatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('syntacticizability rollout integration', () => {

  it('reports syntacticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/syntacticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSyntacticizabilityRollout: true,
      supportsSyntacticizabilityAdminTools: true,
      supportsBillingWebhookSyntacticizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/syntacticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns syntacticizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/syntacticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('rhetorizability rollout integration', () => {

  it('reports rhetorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/rhetorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRhetorizabilityRollout: true,
      supportsRhetorizabilityAdminTools: true,
      supportsMeterUsageRhetorizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/rhetorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns rhetorizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/rhetorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('morphizability rollout integration', () => {

  it('reports morphizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/morphizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMorphizabilityRollout: true,
      supportsMorphizabilityAdminTools: true,
      supportsWorkspaceLimitMorphizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/morphizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns morphizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/morphizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('codifiability rollout integration', () => {

  it('reports codifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/codifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCodifiabilityRollout: true,
      supportsCodifiabilityAdminTools: true,
      supportsProviderCredentialCodifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/codifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns codifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/codifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('hermeticizability rollout integration', () => {

  it('reports hermeticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/hermeticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHermeticizabilityRollout: true,
      supportsHermeticizabilityAdminTools: true,
      supportsModelHealthHermeticizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/hermeticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hermeticizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/hermeticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('epistemizability rollout integration', () => {

  it('reports epistemizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/epistemizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEpistemizabilityRollout: true,
      supportsEpistemizabilityAdminTools: true,
      supportsShieldScanEpistemizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/epistemizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns epistemizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/epistemizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dialectizability rollout integration', () => {

  it('reports dialectizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/dialectizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDialectizabilityRollout: true,
      supportsDialectizabilityAdminTools: true,
      supportsIdempotencyKeyDialectizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/dialectizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dialectizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/dialectizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('ontologizability rollout integration', () => {

  it('reports ontologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/ontologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOntologizabilityRollout: true,
      supportsOntologizabilityAdminTools: true,
      supportsMembershipOntologizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/ontologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ontologizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/ontologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('phenomenizability rollout integration', () => {

  it('reports phenomenizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/phenomenizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPhenomenizabilityRollout: true,
      supportsPhenomenizabilityAdminTools: true,
      supportsBillingInvoicePhenomenizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/phenomenizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns phenomenizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/phenomenizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('axiologizability rollout integration', () => {

  it('reports axiologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/axiologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAxiologizabilityRollout: true,
      supportsAxiologizabilityAdminTools: true,
      supportsBillingNotificationAxiologizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/axiologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns axiologizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/axiologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('teleologizability rollout integration', () => {

  it('reports teleologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/teleologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTeleologizabilityRollout: true,
      supportsTeleologizabilityAdminTools: true,
      supportsBillingWebhookTeleologizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/teleologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns teleologizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/teleologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('gnoseizability rollout integration', () => {

  it('reports gnoseizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/gnoseizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGnoseizabilityRollout: true,
      supportsGnoseizabilityAdminTools: true,
      supportsMeterUsageGnoseizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/gnoseizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns gnoseizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/gnoseizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('methodizability rollout integration', () => {

  it('reports methodizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/methodizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMethodizabilityRollout: true,
      supportsMethodizabilityAdminTools: true,
      supportsWorkspaceLimitMethodizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/methodizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns methodizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/methodizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('historizability rollout integration', () => {

  it('reports historizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/historizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHistorizabilityRollout: true,
      supportsHistorizabilityAdminTools: true,
      supportsProviderCredentialHistorizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/historizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns historizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/historizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('categorizability rollout integration', () => {

  it('reports categorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/categorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCategorizabilityRollout: true,
      supportsCategorizabilityAdminTools: true,
      supportsModelHealthCategorizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/categorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns categorizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/categorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('taxonomizability rollout integration', () => {

  it('reports taxonomizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/taxonomizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTaxonomizabilityRollout: true,
      supportsTaxonomizabilityAdminTools: true,
      supportsShieldScanTaxonomizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/taxonomizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns taxonomizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/taxonomizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('classifiability rollout integration', () => {

  it('reports classifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/classifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsClassifiabilityRollout: true,
      supportsClassifiabilityAdminTools: true,
      supportsIdempotencyKeyClassifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/classifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns classifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/classifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('typologizability rollout integration', () => {

  it('reports typologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/typologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTypologizabilityRollout: true,
      supportsTypologizabilityAdminTools: true,
      supportsMembershipTypologizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/typologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns typologizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/typologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stratifiability rollout integration', () => {

  it('reports stratifiability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/stratifiability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStratifiabilityRollout: true,
      supportsStratifiabilityAdminTools: true,
      supportsBillingInvoiceStratifiabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/stratifiability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stratifiability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/stratifiability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('ordinarizability rollout integration', () => {

  it('reports ordinarizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/ordinarizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrdinarizabilityRollout: true,
      supportsOrdinarizabilityAdminTools: true,
      supportsBillingNotificationOrdinarizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/ordinarizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ordinarizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/ordinarizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('systematizability rollout integration', () => {

  it('reports systematizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/systematizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSystematizabilityRollout: true,
      supportsSystematizabilityAdminTools: true,
      supportsBillingWebhookSystematizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/systematizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns systematizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/systematizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('hierarchizability rollout integration', () => {

  it('reports hierarchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/hierarchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHierarchizabilityRollout: true,
      supportsHierarchizabilityAdminTools: true,
      supportsMeterUsageHierarchizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/hierarchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hierarchizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/hierarchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('segmentizability rollout integration', () => {

  it('reports segmentizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/segmentizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSegmentizabilityRollout: true,
      supportsSegmentizabilityAdminTools: true,
      supportsWorkspaceLimitSegmentizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/segmentizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns segmentizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/segmentizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('clusterizability rollout integration', () => {

  it('reports clusterizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/clusterizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsClusterizabilityRollout: true,
      supportsClusterizabilityAdminTools: true,
      supportsProviderCredentialClusterizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/clusterizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns clusterizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/clusterizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('nomenclatizability rollout integration', () => {

  it('reports nomenclatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/nomenclatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNomenclatizabilityRollout: true,
      supportsNomenclatizabilityAdminTools: true,
      supportsModelHealthNomenclatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/nomenclatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns nomenclatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/nomenclatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('catalogizability rollout integration', () => {

  it('reports catalogizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/catalogizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCatalogizabilityRollout: true,
      supportsCatalogizabilityAdminTools: true,
      supportsShieldScanCatalogizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/catalogizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns catalogizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/catalogizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('indexizability rollout integration', () => {

  it('reports indexizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/indexizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIndexizabilityRollout: true,
      supportsIndexizabilityAdminTools: true,
      supportsIdempotencyKeyIndexizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/indexizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns indexizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/indexizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('directoryizability rollout integration', () => {

  it('reports directoryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/directoryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDirectoryizabilityRollout: true,
      supportsDirectoryizabilityAdminTools: true,
      supportsMembershipDirectoryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/directoryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns directoryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/directoryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('inventoryizability rollout integration', () => {

  it('reports inventoryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/inventoryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInventoryizabilityRollout: true,
      supportsInventoryizabilityAdminTools: true,
      supportsBillingInvoiceInventoryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/inventoryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inventoryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/inventoryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('registryizability rollout integration', () => {

  it('reports registryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/registryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegistryizabilityRollout: true,
      supportsRegistryizabilityAdminTools: true,
      supportsBillingNotificationRegistryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/registryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns registryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/registryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('archivizability rollout integration', () => {

  it('reports archivizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/archivizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsArchivizabilityRollout: true,
      supportsArchivizabilityAdminTools: true,
      supportsBillingWebhookArchivizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/archivizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns archivizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/archivizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('curatizability rollout integration', () => {

  it('reports curatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/curatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCuratizabilityRollout: true,
      supportsCuratizabilityAdminTools: true,
      supportsMeterUsageCuratizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/curatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns curatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/curatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('collectizability rollout integration', () => {

  it('reports collectizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/collectizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCollectizabilityRollout: true,
      supportsCollectizabilityAdminTools: true,
      supportsWorkspaceLimitCollectizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/collectizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns collectizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/collectizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('aggregatizability rollout integration', () => {

  it('reports aggregatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/aggregatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAggregatizabilityRollout: true,
      supportsAggregatizabilityAdminTools: true,
      supportsProviderCredentialAggregatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/aggregatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns aggregatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/aggregatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('compilatizability rollout integration', () => {

  it('reports compilatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compilatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompilatizabilityRollout: true,
      supportsCompilatizabilityAdminTools: true,
      supportsModelHealthCompilatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compilatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compilatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/compilatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('bibliographizability rollout integration', () => {

  it('reports bibliographizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/bibliographizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBibliographizabilityRollout: true,
      supportsBibliographizabilityAdminTools: true,
      supportsShieldScanBibliographizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/bibliographizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns bibliographizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/bibliographizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('referencizability rollout integration', () => {

  it('reports referencizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/referencizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReferencizabilityRollout: true,
      supportsReferencizabilityAdminTools: true,
      supportsIdempotencyKeyReferencizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/referencizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns referencizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/referencizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('documentizability rollout integration', () => {

  it('reports documentizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/documentizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDocumentizabilityRollout: true,
      supportsDocumentizabilityAdminTools: true,
      supportsMembershipDocumentizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/documentizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns documentizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/documentizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('annotationizability rollout integration', () => {

  it('reports annotationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/annotationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAnnotationizabilityRollout: true,
      supportsAnnotationizabilityAdminTools: true,
      supportsBillingInvoiceAnnotationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/annotationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns annotationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/annotationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('citationizability rollout integration', () => {

  it('reports citationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/citationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCitationizabilityRollout: true,
      supportsCitationizabilityAdminTools: true,
      supportsBillingNotificationCitationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/citationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns citationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/citationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('consolidatizability rollout integration', () => {

  it('reports consolidatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/consolidatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConsolidatizabilityRollout: true,
      supportsConsolidatizabilityAdminTools: true,
      supportsBillingWebhookConsolidatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/consolidatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns consolidatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/consolidatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('harmonizability rollout integration', () => {

  it('reports harmonizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/harmonizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHarmonizabilityRollout: true,
      supportsHarmonizabilityAdminTools: true,
      supportsMeterUsageHarmonizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/harmonizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns harmonizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/harmonizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('parametrizability rollout integration', () => {

  it('reports parametrizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/parametrizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsParametrizabilityRollout: true,
      supportsParametrizabilityAdminTools: true,
      supportsWorkspaceLimitParametrizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/parametrizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns parametrizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/parametrizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('serializability rollout integration', () => {

  it('reports serializability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/serializability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSerializabilityRollout: true,
      supportsSerializabilityAdminTools: true,
      supportsProviderCredentialSerializabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/serializability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns serializability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/serializability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('normalizability rollout integration', () => {

  it('reports normalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/normalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNormalizabilityRollout: true,
      supportsNormalizabilityAdminTools: true,
      supportsModelHealthNormalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/normalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns normalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/normalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('glossarizability rollout integration', () => {

  it('reports glossarizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/glossarizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGlossarizabilityRollout: true,
      supportsGlossarizabilityAdminTools: true,
      supportsShieldScanGlossarizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/glossarizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns glossarizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/glossarizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('thesaurusizability rollout integration', () => {

  it('reports thesaurusizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/thesaurusizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsThesaurusizabilityRollout: true,
      supportsThesaurusizabilityAdminTools: true,
      supportsIdempotencyKeyThesaurusizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/thesaurusizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns thesaurusizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/thesaurusizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('terminologizability rollout integration', () => {

  it('reports terminologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/terminologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTerminologizabilityRollout: true,
      supportsTerminologizabilityAdminTools: true,
      supportsMembershipTerminologizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/terminologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns terminologizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/terminologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('vocabularizability rollout integration', () => {

  it('reports vocabularizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/vocabularizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVocabularizabilityRollout: true,
      supportsVocabularizabilityAdminTools: true,
      supportsBillingInvoiceVocabularizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/vocabularizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns vocabularizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/vocabularizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('footnotizability rollout integration', () => {

  it('reports footnotizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/footnotizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFootnotizabilityRollout: true,
      supportsFootnotizabilityAdminTools: true,
      supportsBillingNotificationFootnotizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/footnotizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns footnotizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/footnotizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('contextualizability rollout integration', () => {

  it('reports contextualizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/contextualizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsContextualizabilityRollout: true,
      supportsContextualizabilityAdminTools: true,
      supportsBillingWebhookContextualizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/contextualizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns contextualizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/contextualizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('generalizability rollout integration', () => {

  it('reports generalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/generalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGeneralizabilityRollout: true,
      supportsGeneralizabilityAdminTools: true,
      supportsMeterUsageGeneralizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/generalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns generalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/generalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('standardizability rollout integration', () => {

  it('reports standardizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/standardizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStandardizabilityRollout: true,
      supportsStandardizabilityAdminTools: true,
      supportsWorkspaceLimitStandardizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/standardizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns standardizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/standardizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('formalizability rollout integration', () => {

  it('reports formalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/formalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFormalizabilityRollout: true,
      supportsFormalizabilityAdminTools: true,
      supportsProviderCredentialFormalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/formalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns formalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/formalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('canonicalizability rollout integration', () => {

  it('reports canonicalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/canonicalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCanonicalizabilityRollout: true,
      supportsCanonicalizabilityAdminTools: true,
      supportsModelHealthCanonicalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/canonicalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns canonicalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/canonicalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('abstractizability rollout integration', () => {

  it('reports abstractizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/abstractizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAbstractizabilityRollout: true,
      supportsAbstractizabilityAdminTools: true,
      supportsShieldScanAbstractizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/abstractizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns abstractizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/abstractizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('concretizability rollout integration', () => {

  it('reports concretizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/concretizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConcretizabilityRollout: true,
      supportsConcretizabilityAdminTools: true,
      supportsIdempotencyKeyConcretizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/concretizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns concretizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/concretizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('definizability rollout integration', () => {

  it('reports definizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/definizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDefinizabilityRollout: true,
      supportsDefinizabilityAdminTools: true,
      supportsMembershipDefinizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/definizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns definizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/definizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('inferencizability rollout integration', () => {

  it('reports inferencizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/inferencizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInferencizabilityRollout: true,
      supportsInferencizabilityAdminTools: true,
      supportsBillingInvoiceInferencizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/inferencizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inferencizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/inferencizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deducizability rollout integration', () => {

  it('reports deducizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deducizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeducizabilityRollout: true,
      supportsDeducizabilityAdminTools: true,
      supportsBillingNotificationDeducizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deducizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deducizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/deducizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('probabilizability rollout integration', () => {

  it('reports probabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/probabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProbabilizabilityRollout: true,
      supportsProbabilizabilityAdminTools: true,
      supportsBillingWebhookProbabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/probabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns probabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/probabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stochasticizability rollout integration', () => {

  it('reports stochasticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/stochasticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStochasticizabilityRollout: true,
      supportsStochasticizabilityAdminTools: true,
      supportsMeterUsageStochasticizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/stochasticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stochasticizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/stochasticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('determinizability rollout integration', () => {

  it('reports determinizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/determinizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeterminizabilityRollout: true,
      supportsDeterminizabilityAdminTools: true,
      supportsWorkspaceLimitDeterminizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/determinizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns determinizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/determinizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('predictizability rollout integration', () => {

  it('reports predictizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/predictizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPredictizabilityRollout: true,
      supportsPredictizabilityAdminTools: true,
      supportsProviderCredentialPredictizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/predictizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns predictizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/predictizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('extrapolizability rollout integration', () => {

  it('reports extrapolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/extrapolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExtrapolizabilityRollout: true,
      supportsExtrapolizabilityAdminTools: true,
      supportsModelHealthExtrapolizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/extrapolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns extrapolizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/extrapolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('inductizability rollout integration', () => {

  it('reports inductizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/inductizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInductizabilityRollout: true,
      supportsInductizabilityAdminTools: true,
      supportsShieldScanInductizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/inductizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inductizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/inductizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('abductizability rollout integration', () => {

  it('reports abductizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/abductizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAbductizabilityRollout: true,
      supportsAbductizabilityAdminTools: true,
      supportsIdempotencyKeyAbductizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/abductizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns abductizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/abductizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('retrodictizability rollout integration', () => {

  it('reports retrodictizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/retrodictizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRetrodictizabilityRollout: true,
      supportsRetrodictizabilityAdminTools: true,
      supportsMembershipRetrodictizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/retrodictizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns retrodictizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/retrodictizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('corroborizability rollout integration', () => {

  it('reports corroborizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/corroborizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCorroborizabilityRollout: true,
      supportsCorroborizabilityAdminTools: true,
      supportsBillingInvoiceCorroborizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/corroborizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns corroborizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/corroborizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('falsifiizability rollout integration', () => {

  it('reports falsifiizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/falsifiizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFalsifiizabilityRollout: true,
      supportsFalsifiizabilityAdminTools: true,
      supportsBillingNotificationFalsifiizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/falsifiizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns falsifiizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/falsifiizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('interpolizability rollout integration', () => {

  it('reports interpolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/interpolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterpolizabilityRollout: true,
      supportsInterpolizabilityAdminTools: true,
      supportsBillingWebhookInterpolizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/interpolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interpolizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/interpolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('regressizability rollout integration', () => {

  it('reports regressizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/regressizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegressizabilityRollout: true,
      supportsRegressizabilityAdminTools: true,
      supportsMeterUsageRegressizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/regressizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns regressizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/regressizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('heuristizability rollout integration', () => {

  it('reports heuristizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/heuristizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHeuristizabilityRollout: true,
      supportsHeuristizabilityAdminTools: true,
      supportsWorkspaceLimitHeuristizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/heuristizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns heuristizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/heuristizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('simulatizability rollout integration', () => {

  it('reports simulatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/simulatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSimulatizabilityRollout: true,
      supportsSimulatizabilityAdminTools: true,
      supportsProviderCredentialSimulatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/simulatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns simulatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/simulatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('optimizability rollout integration', () => {

  it('reports optimizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/optimizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOptimizabilityRollout: true,
      supportsOptimizabilityAdminTools: true,
      supportsModelHealthOptimizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/optimizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns optimizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/optimizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('calibratizability rollout integration', () => {

  it('reports calibratizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/calibratizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCalibratizabilityRollout: true,
      supportsCalibratizabilityAdminTools: true,
      supportsShieldScanCalibratizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/calibratizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns calibratizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/calibratizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('metricizability rollout integration', () => {

  it('reports metricizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/metricizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMetricizabilityRollout: true,
      supportsMetricizabilityAdminTools: true,
      supportsIdempotencyKeyMetricizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/metricizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns metricizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/metricizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('benchmarkizability rollout integration', () => {

  it('reports benchmarkizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/benchmarkizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBenchmarkizabilityRollout: true,
      supportsBenchmarkizabilityAdminTools: true,
      supportsMembershipBenchmarkizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/benchmarkizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns benchmarkizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/benchmarkizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('comparizability rollout integration', () => {

  it('reports comparizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/comparizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComparizabilityRollout: true,
      supportsComparizabilityAdminTools: true,
      supportsBillingInvoiceComparizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/comparizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns comparizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/comparizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tolerizability rollout integration', () => {

  it('reports tolerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/tolerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTolerizabilityRollout: true,
      supportsTolerizabilityAdminTools: true,
      supportsBillingNotificationTolerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/tolerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tolerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/tolerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('approximatizability rollout integration', () => {

  it('reports approximatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/approximatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsApproximatizabilityRollout: true,
      supportsApproximatizabilityAdminTools: true,
      supportsBillingWebhookApproximatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/approximatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns approximatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/approximatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('iterativizability rollout integration', () => {

  it('reports iterativizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/iterativizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIterativizabilityRollout: true,
      supportsIterativizabilityAdminTools: true,
      supportsMeterUsageIterativizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/iterativizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns iterativizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/iterativizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('convergizability rollout integration', () => {

  it('reports convergizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/convergizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConvergizabilityRollout: true,
      supportsConvergizabilityAdminTools: true,
      supportsWorkspaceLimitConvergizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/convergizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns convergizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/convergizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('stabilizability rollout integration', () => {

  it('reports stabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/stabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStabilizabilityRollout: true,
      supportsStabilizabilityAdminTools: true,
      supportsProviderCredentialStabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/stabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns stabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/stabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('adaptizability rollout integration', () => {

  it('reports adaptizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/adaptizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAdaptizabilityRollout: true,
      supportsAdaptizabilityAdminTools: true,
      supportsModelHealthAdaptizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/adaptizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns adaptizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/adaptizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('scalabilizability rollout integration', () => {

  it('reports scalabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/scalabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScalabilizabilityRollout: true,
      supportsScalabilizabilityAdminTools: true,
      supportsShieldScanScalabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/scalabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scalabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/scalabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('elasticizability rollout integration', () => {

  it('reports elasticizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/elasticizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsElasticizabilityRollout: true,
      supportsElasticizabilityAdminTools: true,
      supportsIdempotencyKeyElasticizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/elasticizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns elasticizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/elasticizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('resilientizability rollout integration', () => {

  it('reports resilientizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/resilientizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsResilientizabilityRollout: true,
      supportsResilientizabilityAdminTools: true,
      supportsMembershipResilientizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/resilientizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns resilientizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/resilientizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('robustizability rollout integration', () => {

  it('reports robustizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/robustizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRobustizabilityRollout: true,
      supportsRobustizabilityAdminTools: true,
      supportsBillingInvoiceRobustizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/robustizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns robustizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/robustizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dependableizability rollout integration', () => {

  it('reports dependableizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/dependableizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDependableizabilityRollout: true,
      supportsDependableizabilityAdminTools: true,
      supportsBillingNotificationDependableizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/dependableizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dependableizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/dependableizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('recoverizability rollout integration', () => {

  it('reports recoverizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/recoverizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRecoverizabilityRollout: true,
      supportsRecoverizabilityAdminTools: true,
      supportsBillingWebhookRecoverizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/recoverizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns recoverizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/recoverizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('redundizability rollout integration', () => {

  it('reports redundizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/redundizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRedundizabilityRollout: true,
      supportsRedundizabilityAdminTools: true,
      supportsMeterUsageRedundizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/redundizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns redundizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/redundizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('failoverizability rollout integration', () => {

  it('reports failoverizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/failoverizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFailoverizabilityRollout: true,
      supportsFailoverizabilityAdminTools: true,
      supportsWorkspaceLimitFailoverizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/failoverizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns failoverizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/failoverizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('continuizability rollout integration', () => {

  it('reports continuizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/continuizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsContinuizabilityRollout: true,
      supportsContinuizabilityAdminTools: true,
      supportsProviderCredentialContinuizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/continuizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns continuizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/continuizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('sustainizability rollout integration', () => {

  it('reports sustainizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/sustainizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSustainizabilityRollout: true,
      supportsSustainizabilityAdminTools: true,
      supportsModelHealthSustainizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/sustainizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns sustainizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/sustainizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('availabilizability rollout integration', () => {

  it('reports availabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/availabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAvailabilizabilityRollout: true,
      supportsAvailabilizabilityAdminTools: true,
      supportsShieldScanAvailabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/availabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns availabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/availabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('traceabilizability rollout integration', () => {

  it('reports traceabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/traceabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTraceabilizabilityRollout: true,
      supportsTraceabilizabilityAdminTools: true,
      supportsIdempotencyKeyTraceabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/traceabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns traceabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/traceabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('monitorizability rollout integration', () => {

  it('reports monitorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/monitorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMonitorizabilityRollout: true,
      supportsMonitorizabilityAdminTools: true,
      supportsMembershipMonitorizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/monitorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns monitorizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/monitorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('alertabilizability rollout integration', () => {

  it('reports alertabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/alertabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAlertabilizabilityRollout: true,
      supportsAlertabilizabilityAdminTools: true,
      supportsBillingInvoiceAlertabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/alertabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns alertabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/alertabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('observabilizability rollout integration', () => {

  it('reports observabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/observabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsObservabilizabilityRollout: true,
      supportsObservabilizabilityAdminTools: true,
      supportsBillingNotificationObservabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/observabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns observabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/observabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('restorabilizability rollout integration', () => {

  it('reports restorabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/restorabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRestorabilizabilityRollout: true,
      supportsRestorabilizabilityAdminTools: true,
      supportsBillingWebhookRestorabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/restorabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns restorabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/restorabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('replicabilizability rollout integration', () => {

  it('reports replicabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/replicabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReplicabilizabilityRollout: true,
      supportsReplicabilizabilityAdminTools: true,
      supportsMeterUsageReplicabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/replicabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns replicabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/replicabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('loadbalancizability rollout integration', () => {

  it('reports loadbalancizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/loadbalancizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLoadbalancizabilityRollout: true,
      supportsLoadbalancizabilityAdminTools: true,
      supportsWorkspaceLimitLoadbalancizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/loadbalancizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns loadbalancizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/loadbalancizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('autoscalingizability rollout integration', () => {

  it('reports autoscalingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/autoscalingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAutoscalingizabilityRollout: true,
      supportsAutoscalingizabilityAdminTools: true,
      supportsProviderCredentialAutoscalingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/autoscalingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns autoscalingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/autoscalingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deployabilizability rollout integration', () => {

  it('reports deployabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deployabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeployabilizabilityRollout: true,
      supportsDeployabilizabilityAdminTools: true,
      supportsModelHealthDeployabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deployabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deployabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/deployabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('configurabilizability rollout integration', () => {

  it('reports configurabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/configurabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConfigurabilizabilityRollout: true,
      supportsConfigurabilizabilityAdminTools: true,
      supportsShieldScanConfigurabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/configurabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns configurabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/configurabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('operabilizability rollout integration', () => {

  it('reports operabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/operabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOperabilizabilityRollout: true,
      supportsOperabilizabilityAdminTools: true,
      supportsIdempotencyKeyOperabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/operabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns operabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/operabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('maintainabilizability rollout integration', () => {

  it('reports maintainabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/maintainabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMaintainabilizabilityRollout: true,
      supportsMaintainabilizabilityAdminTools: true,
      supportsMembershipMaintainabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/maintainabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns maintainabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/maintainabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('diagnosabilizability rollout integration', () => {

  it('reports diagnosabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/diagnosabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiagnosabilizabilityRollout: true,
      supportsDiagnosabilizabilityAdminTools: true,
      supportsBillingInvoiceDiagnosabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/diagnosabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns diagnosabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/diagnosabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('troubleshootizability rollout integration', () => {

  it('reports troubleshootizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/troubleshootizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTroubleshootizabilityRollout: true,
      supportsTroubleshootizabilityAdminTools: true,
      supportsBillingNotificationTroubleshootizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/troubleshootizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns troubleshootizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/troubleshootizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('rollbackabilizability rollout integration', () => {

  it('reports rollbackabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/rollbackabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRollbackabilizabilityRollout: true,
      supportsRollbackabilizabilityAdminTools: true,
      supportsBillingWebhookRollbackabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/rollbackabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns rollbackabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/rollbackabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('canaryizability rollout integration', () => {

  it('reports canaryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/canaryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCanaryizabilityRollout: true,
      supportsCanaryizabilityAdminTools: true,
      supportsMeterUsageCanaryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/canaryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns canaryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/canaryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('bluegreenizability rollout integration', () => {

  it('reports bluegreenizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/bluegreenizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBluegreenizabilityRollout: true,
      supportsBluegreenizabilityAdminTools: true,
      supportsWorkspaceLimitBluegreenizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/bluegreenizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns bluegreenizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/bluegreenizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('progressiveizability rollout integration', () => {

  it('reports progressiveizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/progressiveizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProgressiveizabilityRollout: true,
      supportsProgressiveizabilityAdminTools: true,
      supportsProviderCredentialProgressiveizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/progressiveizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns progressiveizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/progressiveizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('featureflagizability rollout integration', () => {

  it('reports featureflagizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/featureflagizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFeatureflagizabilityRollout: true,
      supportsFeatureflagizabilityAdminTools: true,
      supportsModelHealthFeatureflagizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/featureflagizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns featureflagizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/featureflagizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('scriptabilizability rollout integration', () => {

  it('reports scriptabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/scriptabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScriptabilizabilityRollout: true,
      supportsScriptabilizabilityAdminTools: true,
      supportsShieldScanScriptabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/scriptabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scriptabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/scriptabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('automatizability rollout integration', () => {

  it('reports automatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/automatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAutomatizabilityRollout: true,
      supportsAutomatizabilityAdminTools: true,
      supportsIdempotencyKeyAutomatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/automatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns automatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/automatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('orchestrizability rollout integration', () => {

  it('reports orchestrizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/orchestrizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrchestrizabilityRollout: true,
      supportsOrchestrizabilityAdminTools: true,
      supportsMembershipOrchestrizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/orchestrizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns orchestrizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/orchestrizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('schedulizability rollout integration', () => {

  it('reports schedulizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/schedulizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSchedulizabilityRollout: true,
      supportsSchedulizabilityAdminTools: true,
      supportsBillingInvoiceSchedulizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/schedulizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns schedulizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/schedulizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('triggerizability rollout integration', () => {

  it('reports triggerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/triggerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTriggerizabilityRollout: true,
      supportsTriggerizabilityAdminTools: true,
      supportsBillingNotificationTriggerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/triggerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns triggerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/triggerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('releasizability rollout integration', () => {

  it('reports releasizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/releasizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReleasizabilityRollout: true,
      supportsReleasizabilityAdminTools: true,
      supportsBillingWebhookReleasizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/releasizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns releasizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/releasizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('versionizability rollout integration', () => {

  it('reports versionizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/versionizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVersionizabilityRollout: true,
      supportsVersionizabilityAdminTools: true,
      supportsMeterUsageVersionizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/versionizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns versionizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/versionizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('migratizability rollout integration', () => {

  it('reports migratizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/migratizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMigratizabilityRollout: true,
      supportsMigratizabilityAdminTools: true,
      supportsWorkspaceLimitMigratizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/migratizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns migratizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/migratizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('upgradizability rollout integration', () => {

  it('reports upgradizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/upgradizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUpgradizabilityRollout: true,
      supportsUpgradizabilityAdminTools: true,
      supportsProviderCredentialUpgradizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/upgradizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns upgradizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/upgradizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('patchizability rollout integration', () => {

  it('reports patchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/patchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPatchizabilityRollout: true,
      supportsPatchizabilityAdminTools: true,
      supportsModelHealthPatchizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/patchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns patchizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/patchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('integrabilizability rollout integration', () => {

  it('reports integrabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/integrabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrabilizabilityRollout: true,
      supportsIntegrabilizabilityAdminTools: true,
      supportsShieldScanIntegrabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/integrabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/integrabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('composabilizability rollout integration', () => {

  it('reports composabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/composabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComposabilizabilityRollout: true,
      supportsComposabilizabilityAdminTools: true,
      supportsIdempotencyKeyComposabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/composabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns composabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/composabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('modularizability rollout integration', () => {

  it('reports modularizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/modularizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsModularizabilityRollout: true,
      supportsModularizabilityAdminTools: true,
      supportsMembershipModularizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/modularizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns modularizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/modularizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('extensibilizability rollout integration', () => {

  it('reports extensibilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/extensibilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExtensibilizabilityRollout: true,
      supportsExtensibilizabilityAdminTools: true,
      supportsBillingInvoiceExtensibilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/extensibilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns extensibilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/extensibilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('pluggabilizability rollout integration', () => {

  it('reports pluggabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/pluggabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPluggabilizabilityRollout: true,
      supportsPluggabilizabilityAdminTools: true,
      supportsBillingNotificationPluggabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/pluggabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns pluggabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/pluggabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('compatibilizability rollout integration', () => {

  it('reports compatibilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compatibilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompatibilizabilityRollout: true,
      supportsCompatibilizabilityAdminTools: true,
      supportsBillingWebhookCompatibilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compatibilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compatibilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/compatibilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interoperabilizability rollout integration', () => {

  it('reports interoperabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/interoperabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInteroperabilizabilityRollout: true,
      supportsInteroperabilizabilityAdminTools: true,
      supportsMeterUsageInteroperabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/interoperabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interoperabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/interoperabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('connectabilizability rollout integration', () => {

  it('reports connectabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/connectabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConnectabilizabilityRollout: true,
      supportsConnectabilizabilityAdminTools: true,
      supportsWorkspaceLimitConnectabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/connectabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns connectabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/connectabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('interfabilizability rollout integration', () => {

  it('reports interfabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/interfabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInterfabilizabilityRollout: true,
      supportsInterfabilizabilityAdminTools: true,
      supportsProviderCredentialInterfabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/interfabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns interfabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/interfabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('protocolizability rollout integration', () => {

  it('reports protocolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/protocolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProtocolizabilityRollout: true,
      supportsProtocolizabilityAdminTools: true,
      supportsModelHealthProtocolizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/protocolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns protocolizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
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
    await request(app.getHttpServer())
      .get('/api/protocolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('encapsulizability rollout integration', () => {

  it('reports encapsulizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/encapsulizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEncapsulizabilityRollout: true,
      supportsEncapsulizabilityAdminTools: true,
      supportsShieldScanEncapsulizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/encapsulizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns encapsulizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/encapsulizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        encapsulizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects encapsulizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/encapsulizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('isolatizability rollout integration', () => {

  it('reports isolatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/isolatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIsolatizabilityRollout: true,
      supportsIsolatizabilityAdminTools: true,
      supportsIdempotencyKeyIsolatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/isolatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns isolatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/isolatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        isolatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects isolatizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/isolatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('sandboxizability rollout integration', () => {

  it('reports sandboxizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/sandboxizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSandboxizabilityRollout: true,
      supportsSandboxizabilityAdminTools: true,
      supportsMembershipSandboxizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/sandboxizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns sandboxizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/sandboxizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        sandboxizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects sandboxizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/sandboxizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('containerizability rollout integration', () => {

  it('reports containerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/containerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsContainerizabilityRollout: true,
      supportsContainerizabilityAdminTools: true,
      supportsBillingInvoiceContainerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/containerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns containerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/containerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        containerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects containerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/containerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('boundarizability rollout integration', () => {

  it('reports boundarizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/boundarizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBoundarizabilityRollout: true,
      supportsBoundarizabilityAdminTools: true,
      supportsBillingNotificationBoundarizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/boundarizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns boundarizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/boundarizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        boundarizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects boundarizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/boundarizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('virtualizability rollout integration', () => {

  it('reports virtualizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/virtualizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVirtualizabilityRollout: true,
      supportsVirtualizabilityAdminTools: true,
      supportsBillingWebhookVirtualizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/virtualizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns virtualizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/virtualizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        virtualizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects virtualizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/virtualizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('distributizability rollout integration', () => {

  it('reports distributizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/distributizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDistributizabilityRollout: true,
      supportsDistributizabilityAdminTools: true,
      supportsMeterUsageDistributizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/distributizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns distributizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/distributizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        distributizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects distributizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/distributizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('federatizability rollout integration', () => {

  it('reports federatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/federatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFederatizabilityRollout: true,
      supportsFederatizabilityAdminTools: true,
      supportsWorkspaceLimitFederatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/federatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns federatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/federatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        federatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects federatizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/federatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('decentralizability rollout integration', () => {

  it('reports decentralizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/decentralizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDecentralizabilityRollout: true,
      supportsDecentralizabilityAdminTools: true,
      supportsProviderCredentialDecentralizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/decentralizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns decentralizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/decentralizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        decentralizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects decentralizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/decentralizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('meshabilizability rollout integration', () => {

  it('reports meshabilizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/meshabilizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMeshabilizabilityRollout: true,
      supportsMeshabilizabilityAdminTools: true,
      supportsModelHealthMeshabilizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/meshabilizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns meshabilizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/meshabilizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        meshabilizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects meshabilizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/meshabilizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('topologizability rollout integration', () => {
  it('reports topologizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/topologizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTopologizabilityRollout: true,
      supportsTopologizabilityAdminTools: true,
      supportsBillingWebhookTopologizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/topologizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns topologizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/topologizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        topologizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects topologizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/topologizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('networkizability rollout integration', () => {
  it('reports networkizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/networkizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNetworkizabilityRollout: true,
      supportsNetworkizabilityAdminTools: true,
      supportsMeterUsageNetworkizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/networkizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns networkizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/networkizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        networkizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects networkizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/networkizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('gatewayizability rollout integration', () => {
  it('reports gatewayizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/gatewayizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGatewayizabilityRollout: true,
      supportsGatewayizabilityAdminTools: true,
      supportsWorkspaceLimitGatewayizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/gatewayizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns gatewayizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/gatewayizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        gatewayizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects gatewayizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/gatewayizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('brokerizability rollout integration', () => {
  it('reports brokerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/brokerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBrokerizabilityRollout: true,
      supportsBrokerizabilityAdminTools: true,
      supportsProviderCredentialBrokerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/brokerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns brokerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/brokerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        brokerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects brokerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/brokerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('relayizability rollout integration', () => {
  it('reports relayizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/relayizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRelayizabilityRollout: true,
      supportsRelayizabilityAdminTools: true,
      supportsModelHealthRelayizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/relayizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns relayizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/relayizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        relayizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects relayizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/relayizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('routizability rollout integration', () => {
  it('reports routizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/routizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRoutizabilityRollout: true,
      supportsRoutizabilityAdminTools: true,
      supportsShieldScanRoutizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/routizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns routizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/routizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        routizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects routizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/routizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('queueizability rollout integration', () => {
  it('reports queueizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/queueizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsQueueizabilityRollout: true,
      supportsQueueizabilityAdminTools: true,
      supportsIdempotencyKeyQueueizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/queueizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns queueizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/queueizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        queueizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects queueizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/queueizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('eventizability rollout integration', () => {
  it('reports eventizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/eventizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEventizabilityRollout: true,
      supportsEventizabilityAdminTools: true,
      supportsMembershipEventizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/eventizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns eventizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/eventizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        eventizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects eventizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/eventizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('channelizability rollout integration', () => {
  it('reports channelizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/channelizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsChannelizabilityRollout: true,
      supportsChannelizabilityAdminTools: true,
      supportsBillingInvoiceChannelizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/channelizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns channelizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/channelizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        channelizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects channelizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/channelizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('notifizability rollout integration', () => {
  it('reports notifizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/notifizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNotifizabilityRollout: true,
      supportsNotifizabilityAdminTools: true,
      supportsBillingNotificationNotifizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/notifizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns notifizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/notifizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        notifizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects notifizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/notifizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('subscribizability rollout integration', () => {
  it('reports subscribizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/subscribizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSubscribizabilityRollout: true,
      supportsSubscribizabilityAdminTools: true,
      supportsBillingWebhookSubscribizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/subscribizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns subscribizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/subscribizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        subscribizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects subscribizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/subscribizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('publishizability rollout integration', () => {
  it('reports publishizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/publishizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPublishizabilityRollout: true,
      supportsPublishizabilityAdminTools: true,
      supportsMeterUsagePublishizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/publishizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns publishizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/publishizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        publishizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects publishizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/publishizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('consumizability rollout integration', () => {
  it('reports consumizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/consumizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConsumizabilityRollout: true,
      supportsConsumizabilityAdminTools: true,
      supportsWorkspaceLimitConsumizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/consumizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns consumizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/consumizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        consumizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects consumizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/consumizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deliverizability rollout integration', () => {
  it('reports deliverizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deliverizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeliverizabilityRollout: true,
      supportsDeliverizabilityAdminTools: true,
      supportsProviderCredentialDeliverizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deliverizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deliverizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/deliverizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        deliverizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects deliverizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/deliverizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dispatchizability rollout integration', () => {
  it('reports dispatchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/dispatchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDispatchizabilityRollout: true,
      supportsDispatchizabilityAdminTools: true,
      supportsModelHealthDispatchizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/dispatchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dispatchizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dispatchizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        dispatchizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects dispatchizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/dispatchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('handoffizability rollout integration', () => {
  it('reports handoffizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/handoffizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHandoffizabilityRollout: true,
      supportsHandoffizabilityAdminTools: true,
      supportsShieldScanHandoffizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/handoffizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns handoffizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/handoffizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        handoffizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects handoffizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/handoffizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('synchronizability rollout integration', () => {
  it('reports synchronizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/synchronizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSynchronizabilityRollout: true,
      supportsSynchronizabilityAdminTools: true,
      supportsIdempotencyKeySynchronizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/synchronizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns synchronizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/synchronizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        synchronizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects synchronizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/synchronizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('asynchronizability rollout integration', () => {
  it('reports asynchronizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/asynchronizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAsynchronizabilityRollout: true,
      supportsAsynchronizabilityAdminTools: true,
      supportsMembershipAsynchronizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/asynchronizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns asynchronizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/asynchronizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        asynchronizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects asynchronizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/asynchronizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('broadcastizability rollout integration', () => {
  it('reports broadcastizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/broadcastizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBroadcastizabilityRollout: true,
      supportsBroadcastizabilityAdminTools: true,
      supportsBillingInvoiceBroadcastizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/broadcastizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns broadcastizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/broadcastizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        broadcastizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects broadcastizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/broadcastizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('multicastizability rollout integration', () => {
  it('reports multicastizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/multicastizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMulticastizabilityRollout: true,
      supportsMulticastizabilityAdminTools: true,
      supportsBillingNotificationMulticastizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/multicastizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns multicastizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/multicastizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        multicastizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects multicastizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/multicastizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('unicastizability rollout integration', () => {
  it('reports unicastizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/unicastizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsUnicastizabilityRollout: true,
      supportsUnicastizabilityAdminTools: true,
      supportsBillingWebhookUnicastizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/unicastizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns unicastizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/unicastizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        unicastizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects unicastizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/unicastizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('fanoutizability rollout integration', () => {
  it('reports fanoutizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/fanoutizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFanoutizabilityRollout: true,
      supportsFanoutizabilityAdminTools: true,
      supportsMeterUsageFanoutizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/fanoutizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns fanoutizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/fanoutizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        fanoutizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects fanoutizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/fanoutizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('backpressureizability rollout integration', () => {
  it('reports backpressureizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/backpressureizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBackpressureizabilityRollout: true,
      supportsBackpressureizabilityAdminTools: true,
      supportsWorkspaceLimitBackpressureizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/backpressureizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns backpressureizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/backpressureizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        backpressureizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects backpressureizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/backpressureizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('throttleizability rollout integration', () => {
  it('reports throttleizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/throttleizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsThrottleizabilityRollout: true,
      supportsThrottleizabilityAdminTools: true,
      supportsProviderCredentialThrottleizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/throttleizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns throttleizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/throttleizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        throttleizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects throttleizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/throttleizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('debouncizability rollout integration', () => {
  it('reports debouncizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/debouncizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDebouncizabilityRollout: true,
      supportsDebouncizabilityAdminTools: true,
      supportsModelHealthDebouncizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/debouncizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns debouncizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/debouncizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        debouncizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects debouncizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/debouncizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('bufferizability rollout integration', () => {
  it('reports bufferizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/bufferizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBufferizabilityRollout: true,
      supportsBufferizabilityAdminTools: true,
      supportsShieldScanBufferizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/bufferizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns bufferizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/bufferizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        bufferizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects bufferizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/bufferizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('batchizability rollout integration', () => {
  it('reports batchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/batchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBatchizabilityRollout: true,
      supportsBatchizabilityAdminTools: true,
      supportsIdempotencyKeyBatchizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/batchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns batchizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/batchizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        batchizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects batchizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/batchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('retryizability rollout integration', () => {
  it('reports retryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/retryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRetryizabilityRollout: true,
      supportsRetryizabilityAdminTools: true,
      supportsMembershipRetryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/retryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns retryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/retryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        retryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects retryizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/retryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('circuitizability rollout integration', () => {
  it('reports circuitizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/circuitizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCircuitizabilityRollout: true,
      supportsCircuitizabilityAdminTools: true,
      supportsBillingInvoiceCircuitizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/circuitizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns circuitizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/circuitizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        circuitizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects circuitizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/circuitizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('timeoutizability rollout integration', () => {
  it('reports timeoutizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/timeoutizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTimeoutizabilityRollout: true,
      supportsTimeoutizabilityAdminTools: true,
      supportsBillingNotificationTimeoutizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/timeoutizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns timeoutizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/timeoutizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        timeoutizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects timeoutizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/timeoutizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('ackizability rollout integration', () => {
  it('reports ackizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/ackizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAckizabilityRollout: true,
      supportsAckizabilityAdminTools: true,
      supportsBillingWebhookAckizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/ackizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ackizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ackizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        ackizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects ackizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/ackizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('nackizability rollout integration', () => {
  it('reports nackizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/nackizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNackizabilityRollout: true,
      supportsNackizabilityAdminTools: true,
      supportsMeterUsageNackizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/nackizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns nackizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/nackizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        nackizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects nackizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/nackizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deadletterizability rollout integration', () => {
  it('reports deadletterizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deadletterizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeadletterizabilityRollout: true,
      supportsDeadletterizabilityAdminTools: true,
      supportsWorkspaceLimitDeadletterizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deadletterizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deadletterizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/deadletterizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        deadletterizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects deadletterizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/deadletterizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('dedupizability rollout integration', () => {
  it('reports dedupizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/dedupizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDedupizabilityRollout: true,
      supportsDedupizabilityAdminTools: true,
      supportsProviderCredentialDedupizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/dedupizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns dedupizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/dedupizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        dedupizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects dedupizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/dedupizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('sequencizability rollout integration', () => {
  it('reports sequencizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/sequencizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSequencizabilityRollout: true,
      supportsSequencizabilityAdminTools: true,
      supportsModelHealthSequencizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/sequencizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns sequencizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/sequencizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        sequencizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects sequencizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/sequencizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('partitionizability rollout integration', () => {
  it('reports partitionizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/partitionizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPartitionizabilityRollout: true,
      supportsPartitionizabilityAdminTools: true,
      supportsShieldScanPartitionizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/partitionizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns partitionizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/partitionizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        partitionizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects partitionizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/partitionizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('shardingizability rollout integration', () => {
  it('reports shardingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/shardingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsShardingizabilityRollout: true,
      supportsShardingizabilityAdminTools: true,
      supportsIdempotencyKeyShardingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/shardingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns shardingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/shardingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        shardingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects shardingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/shardingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('orderingizability rollout integration', () => {
  it('reports orderingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/orderingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrderingizabilityRollout: true,
      supportsOrderingizabilityAdminTools: true,
      supportsMembershipOrderingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/orderingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns orderingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/orderingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        orderingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects orderingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/orderingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('checkpointizability rollout integration', () => {
  it('reports checkpointizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/checkpointizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCheckpointizabilityRollout: true,
      supportsCheckpointizabilityAdminTools: true,
      supportsBillingInvoiceCheckpointizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/checkpointizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns checkpointizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/checkpointizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        checkpointizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects checkpointizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/checkpointizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('recoveryizability rollout integration', () => {
  it('reports recoveryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/recoveryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRecoveryizabilityRollout: true,
      supportsRecoveryizabilityAdminTools: true,
      supportsBillingNotificationRecoveryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/recoveryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns recoveryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/recoveryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        recoveryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects recoveryizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/recoveryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('compactionizability rollout integration', () => {
  it('reports compactionizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compactionizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompactionizabilityRollout: true,
      supportsCompactionizabilityAdminTools: true,
      supportsBillingWebhookCompactionizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compactionizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compactionizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/compactionizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compactionizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compactionizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/compactionizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('rebalanceizability rollout integration', () => {
  it('reports rebalanceizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/rebalanceizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRebalanceizabilityRollout: true,
      supportsRebalanceizabilityAdminTools: true,
      supportsMeterUsageRebalanceizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/rebalanceizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns rebalanceizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/rebalanceizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        rebalanceizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects rebalanceizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/rebalanceizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('leaderizability rollout integration', () => {
  it('reports leaderizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/leaderizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLeaderizabilityRollout: true,
      supportsLeaderizabilityAdminTools: true,
      supportsWorkspaceLimitLeaderizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/leaderizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns leaderizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/leaderizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        leaderizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects leaderizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/leaderizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('followerizability rollout integration', () => {
  it('reports followerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/followerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFollowerizabilityRollout: true,
      supportsFollowerizabilityAdminTools: true,
      supportsProviderCredentialFollowerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/followerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns followerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/followerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        followerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects followerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/followerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('consensusizability rollout integration', () => {
  it('reports consensusizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/consensusizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConsensusizabilityRollout: true,
      supportsConsensusizabilityAdminTools: true,
      supportsModelHealthConsensusizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/consensusizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns consensusizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/consensusizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        consensusizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects consensusizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/consensusizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('quorumizability rollout integration', () => {
  it('reports quorumizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/quorumizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsQuorumizabilityRollout: true,
      supportsQuorumizabilityAdminTools: true,
      supportsShieldScanQuorumizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/quorumizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns quorumizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/quorumizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        quorumizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects quorumizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/quorumizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('snapshotizability rollout integration', () => {
  it('reports snapshotizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/snapshotizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSnapshotizabilityRollout: true,
      supportsSnapshotizabilityAdminTools: true,
      supportsIdempotencyKeySnapshotizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/snapshotizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns snapshotizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/snapshotizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        snapshotizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects snapshotizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/snapshotizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('journalizability rollout integration', () => {
  it('reports journalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/journalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsJournalizabilityRollout: true,
      supportsJournalizabilityAdminTools: true,
      supportsMembershipJournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/journalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns journalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/journalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        journalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects journalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/journalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('appendizability rollout integration', () => {
  it('reports appendizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/appendizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAppendizabilityRollout: true,
      supportsAppendizabilityAdminTools: true,
      supportsBillingInvoiceAppendizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/appendizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns appendizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/appendizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        appendizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects appendizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/appendizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('walizability rollout integration', () => {
  it('reports walizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/walizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWalizabilityRollout: true,
      supportsWalizabilityAdminTools: true,
      supportsBillingNotificationWalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/walizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns walizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/walizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        walizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects walizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/walizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('replicationizability rollout integration', () => {
  it('reports replicationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/replicationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReplicationizabilityRollout: true,
      supportsReplicationizabilityAdminTools: true,
      supportsBillingWebhookReplicationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/replicationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns replicationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/replicationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        replicationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects replicationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/replicationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('mirroringizability rollout integration', () => {
  it('reports mirroringizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/mirroringizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMirroringizabilityRollout: true,
      supportsMirroringizabilityAdminTools: true,
      supportsMeterUsageMirroringizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/mirroringizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns mirroringizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/mirroringizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        mirroringizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects mirroringizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/mirroringizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('cloningizability rollout integration', () => {
  it('reports cloningizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/cloningizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCloningizabilityRollout: true,
      supportsCloningizabilityAdminTools: true,
      supportsWorkspaceLimitCloningizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/cloningizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns cloningizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/cloningizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        cloningizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects cloningizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/cloningizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('propagationizability rollout integration', () => {
  it('reports propagationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/propagationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPropagationizabilityRollout: true,
      supportsPropagationizabilityAdminTools: true,
      supportsProviderCredentialPropagationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/propagationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns propagationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/propagationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        propagationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects propagationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/propagationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('materializationizability rollout integration', () => {
  it('reports materializationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/materializationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMaterializationizabilityRollout: true,
      supportsMaterializationizabilityAdminTools: true,
      supportsModelHealthMaterializationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/materializationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns materializationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/materializationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        materializationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects materializationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/materializationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('hydrationizability rollout integration', () => {
  it('reports hydrationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/hydrationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHydrationizabilityRollout: true,
      supportsHydrationizabilityAdminTools: true,
      supportsShieldScanHydrationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/hydrationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hydrationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/hydrationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        hydrationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects hydrationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/hydrationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('invalidationizability rollout integration', () => {
  it('reports invalidationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/invalidationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInvalidationizabilityRollout: true,
      supportsInvalidationizabilityAdminTools: true,
      supportsIdempotencyKeyInvalidationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/invalidationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns invalidationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/invalidationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        invalidationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects invalidationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/invalidationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('evictionizability rollout integration', () => {
  it('reports evictionizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/evictionizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEvictionizabilityRollout: true,
      supportsEvictionizabilityAdminTools: true,
      supportsMembershipEvictionizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/evictionizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns evictionizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/evictionizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        evictionizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects evictionizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/evictionizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('ttlizability rollout integration', () => {
  it('reports ttlizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/ttlizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTtlizabilityRollout: true,
      supportsTtlizabilityAdminTools: true,
      supportsBillingInvoiceTtlizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/ttlizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ttlizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ttlizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        ttlizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects ttlizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/ttlizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('expirationizability rollout integration', () => {
  it('reports expirationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/expirationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExpirationizabilityRollout: true,
      supportsExpirationizabilityAdminTools: true,
      supportsBillingNotificationExpirationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/expirationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns expirationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/expirationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        expirationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects expirationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/expirationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('refreshizability rollout integration', () => {
  it('reports refreshizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/refreshizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRefreshizabilityRollout: true,
      supportsRefreshizabilityAdminTools: true,
      supportsBillingWebhookRefreshizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/refreshizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns refreshizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/refreshizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        refreshizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects refreshizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/refreshizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('warmizability rollout integration', () => {
  it('reports warmizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/warmizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWarmizabilityRollout: true,
      supportsWarmizabilityAdminTools: true,
      supportsMeterUsageWarmizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/warmizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns warmizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/warmizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        warmizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects warmizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/warmizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('coldizability rollout integration', () => {
  it('reports coldizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/coldizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsColdizabilityRollout: true,
      supportsColdizabilityAdminTools: true,
      supportsWorkspaceLimitColdizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/coldizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns coldizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/coldizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        coldizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects coldizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/coldizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('prefetchizability rollout integration', () => {
  it('reports prefetchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/prefetchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPrefetchizabilityRollout: true,
      supportsPrefetchizabilityAdminTools: true,
      supportsProviderCredentialPrefetchizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/prefetchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns prefetchizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/prefetchizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        prefetchizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects prefetchizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/prefetchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('cacheizability rollout integration', () => {
  it('reports cacheizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/cacheizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCacheizabilityRollout: true,
      supportsCacheizabilityAdminTools: true,
      supportsModelHealthCacheizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/cacheizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns cacheizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/cacheizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        cacheizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects cacheizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/cacheizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('memorizability rollout integration', () => {
  it('reports memorizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/memorizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMemorizabilityRollout: true,
      supportsMemorizabilityAdminTools: true,
      supportsShieldScanMemorizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/memorizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns memorizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/memorizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        memorizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects memorizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/memorizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('persistizability rollout integration', () => {
  it('reports persistizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/persistizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPersistizabilityRollout: true,
      supportsPersistizabilityAdminTools: true,
      supportsIdempotencyKeyPersistizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/persistizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns persistizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/persistizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        persistizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects persistizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/persistizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('compressizability rollout integration', () => {
  it('reports compressizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compressizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompressizabilityRollout: true,
      supportsCompressizabilityAdminTools: true,
      supportsMembershipCompressizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compressizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compressizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/compressizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compressizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compressizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/compressizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('decompressizability rollout integration', () => {
  it('reports decompressizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/decompressizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDecompressizabilityRollout: true,
      supportsDecompressizabilityAdminTools: true,
      supportsBillingInvoiceDecompressizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/decompressizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns decompressizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/decompressizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        decompressizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects decompressizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/decompressizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('archiveizability rollout integration', () => {
  it('reports archiveizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/archiveizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsArchiveizabilityRollout: true,
      supportsArchiveizabilityAdminTools: true,
      supportsBillingNotificationArchiveizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/archiveizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns archiveizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/archiveizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        archiveizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects archiveizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/archiveizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('restoreizability rollout integration', () => {
  it('reports restoreizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/restoreizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRestoreizabilityRollout: true,
      supportsRestoreizabilityAdminTools: true,
      supportsBillingWebhookRestoreizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/restoreizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns restoreizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/restoreizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        restoreizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects restoreizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/restoreizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('backupizability rollout integration', () => {
  it('reports backupizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/backupizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBackupizabilityRollout: true,
      supportsBackupizabilityAdminTools: true,
      supportsMeterUsageBackupizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/backupizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns backupizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/backupizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        backupizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects backupizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/backupizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('exportizability rollout integration', () => {
  it('reports exportizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/exportizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExportizabilityRollout: true,
      supportsExportizabilityAdminTools: true,
      supportsWorkspaceLimitExportizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/exportizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns exportizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/exportizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        exportizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects exportizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/exportizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('importizability rollout integration', () => {
  it('reports importizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/importizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsImportizabilityRollout: true,
      supportsImportizabilityAdminTools: true,
      supportsProviderCredentialImportizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/importizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns importizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/importizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        importizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects importizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/importizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('indexingizability rollout integration', () => {
  it('reports indexingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/indexingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIndexingizabilityRollout: true,
      supportsIndexingizabilityAdminTools: true,
      supportsModelHealthIndexingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/indexingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns indexingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/indexingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        indexingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects indexingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/indexingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('searchizability rollout integration', () => {
  it('reports searchizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/searchizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSearchizabilityRollout: true,
      supportsSearchizabilityAdminTools: true,
      supportsShieldScanSearchizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/searchizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns searchizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/searchizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        searchizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects searchizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/searchizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('versioningizability rollout integration', () => {
  it('reports versioningizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/versioningizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVersioningizabilityRollout: true,
      supportsVersioningizabilityAdminTools: true,
      supportsIdempotencyKeyVersioningizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/versioningizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns versioningizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/versioningizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        versioningizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects versioningizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/versioningizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('compactizability rollout integration', () => {
  it('reports compactizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compactizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompactizabilityRollout: true,
      supportsCompactizabilityAdminTools: true,
      supportsMembershipCompactizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compactizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compactizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/compactizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compactizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compactizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/compactizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('expandizability rollout integration', () => {
  it('reports expandizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/expandizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExpandizabilityRollout: true,
      supportsExpandizabilityAdminTools: true,
      supportsBillingInvoiceExpandizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/expandizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns expandizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/expandizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        expandizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects expandizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/expandizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('retentionizability rollout integration', () => {
  it('reports retentionizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/retentionizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRetentionizabilityRollout: true,
      supportsRetentionizabilityAdminTools: true,
      supportsBillingNotificationRetentionizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/retentionizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns retentionizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/retentionizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        retentionizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects retentionizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/retentionizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('queryizability rollout integration', () => {
  it('reports queryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/queryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsQueryizabilityRollout: true,
      supportsQueryizabilityAdminTools: true,
      supportsBillingWebhookQueryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/queryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns queryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/queryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        queryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects queryizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/queryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('filterizability rollout integration', () => {
  it('reports filterizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/filterizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFilterizabilityRollout: true,
      supportsFilterizabilityAdminTools: true,
      supportsMeterUsageFilterizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/filterizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns filterizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/filterizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        filterizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects filterizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/filterizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('sortizability rollout integration', () => {
  it('reports sortizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/sortizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSortizabilityRollout: true,
      supportsSortizabilityAdminTools: true,
      supportsWorkspaceLimitSortizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/sortizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns sortizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/sortizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        sortizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects sortizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/sortizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('paginizability rollout integration', () => {
  it('reports paginizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/paginizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPaginizabilityRollout: true,
      supportsPaginizabilityAdminTools: true,
      supportsProviderCredentialPaginizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/paginizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns paginizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/paginizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        paginizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects paginizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/paginizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('pivotizability rollout integration', () => {
  it('reports pivotizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/pivotizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPivotizabilityRollout: true,
      supportsPivotizabilityAdminTools: true,
      supportsModelHealthPivotizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/pivotizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns pivotizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/pivotizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        pivotizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects pivotizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/pivotizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('groupizability rollout integration', () => {
  it('reports groupizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/groupizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGroupizabilityRollout: true,
      supportsGroupizabilityAdminTools: true,
      supportsShieldScanGroupizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/groupizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns groupizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/groupizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        groupizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects groupizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/groupizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('joinizability rollout integration', () => {
  it('reports joinizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/joinizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsJoinizabilityRollout: true,
      supportsJoinizabilityAdminTools: true,
      supportsIdempotencyKeyJoinizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/joinizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns joinizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/joinizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        joinizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects joinizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/joinizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('mergeizability rollout integration', () => {
  it('reports mergeizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/mergeizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMergeizabilityRollout: true,
      supportsMergeizabilityAdminTools: true,
      supportsMembershipMergeizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/mergeizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns mergeizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/mergeizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        mergeizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects mergeizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/mergeizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('splitizability rollout integration', () => {
  it('reports splitizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/splitizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSplitizabilityRollout: true,
      supportsSplitizabilityAdminTools: true,
      supportsBillingInvoiceSplitizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/splitizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns splitizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/splitizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        splitizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects splitizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/splitizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('projectizability rollout integration', () => {
  it('reports projectizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/projectizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProjectizabilityRollout: true,
      supportsProjectizabilityAdminTools: true,
      supportsBillingNotificationProjectizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/projectizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns projectizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/projectizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        projectizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects projectizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/projectizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('transformizability rollout integration', () => {
  it('reports transformizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/transformizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTransformizabilityRollout: true,
      supportsTransformizabilityAdminTools: true,
      supportsBillingWebhookTransformizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/transformizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns transformizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transformizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        transformizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects transformizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/transformizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('mapizability rollout integration', () => {
  it('reports mapizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/mapizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMapizabilityRollout: true,
      supportsMapizabilityAdminTools: true,
      supportsMeterUsageMapizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/mapizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns mapizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/mapizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        mapizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects mapizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/mapizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reduceizability rollout integration', () => {
  it('reports reduceizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/reduceizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReduceizabilityRollout: true,
      supportsReduceizabilityAdminTools: true,
      supportsWorkspaceLimitReduceizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/reduceizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reduceizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/reduceizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        reduceizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reduceizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/reduceizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('foldizability rollout integration', () => {
  it('reports foldizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/foldizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsFoldizabilityRollout: true,
      supportsFoldizabilityAdminTools: true,
      supportsProviderCredentialFoldizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/foldizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns foldizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/foldizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        foldizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects foldizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/foldizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('scanizability rollout integration', () => {
  it('reports scanizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/scanizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScanizabilityRollout: true,
      supportsScanizabilityAdminTools: true,
      supportsModelHealthScanizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/scanizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scanizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/scanizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        scanizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects scanizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/scanizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('chainingizability rollout integration', () => {
  it('reports chainingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/chainingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsChainingizabilityRollout: true,
      supportsChainingizabilityAdminTools: true,
      supportsShieldScanChainingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/chainingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns chainingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/chainingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        chainingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects chainingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/chainingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('pipeliningizability rollout integration', () => {
  it('reports pipeliningizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/pipeliningizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPipeliningizabilityRollout: true,
      supportsPipeliningizabilityAdminTools: true,
      supportsIdempotencyKeyPipeliningizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/pipeliningizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns pipeliningizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/pipeliningizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        pipeliningizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects pipeliningizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/pipeliningizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('batchingizability rollout integration', () => {
  it('reports batchingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/batchingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBatchingizabilityRollout: true,
      supportsBatchingizabilityAdminTools: true,
      supportsMembershipBatchingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/batchingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns batchingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/batchingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        batchingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects batchingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/batchingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('streamizability rollout integration', () => {
  it('reports streamizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/streamizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsStreamizabilityRollout: true,
      supportsStreamizabilityAdminTools: true,
      supportsBillingInvoiceStreamizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/streamizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns streamizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/streamizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        streamizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects streamizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/streamizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('windowizability rollout integration', () => {
  it('reports windowizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/windowizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWindowizabilityRollout: true,
      supportsWindowizabilityAdminTools: true,
      supportsBillingNotificationWindowizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/windowizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns windowizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/windowizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        windowizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects windowizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/windowizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('orchestrationizability rollout integration', () => {
  it('reports orchestrationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/orchestrationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOrchestrationizabilityRollout: true,
      supportsOrchestrationizabilityAdminTools: true,
      supportsBillingWebhookOrchestrationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/orchestrationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns orchestrationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/orchestrationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        orchestrationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects orchestrationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/orchestrationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('schedulingizability rollout integration', () => {
  it('reports schedulingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/schedulingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSchedulingizabilityRollout: true,
      supportsSchedulingizabilityAdminTools: true,
      supportsMeterUsageSchedulingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/schedulingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns schedulingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/schedulingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        schedulingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects schedulingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/schedulingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('triggeringizability rollout integration', () => {
  it('reports triggeringizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/triggeringizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTriggeringizabilityRollout: true,
      supportsTriggeringizabilityAdminTools: true,
      supportsWorkspaceLimitTriggeringizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/triggeringizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns triggeringizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/triggeringizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        triggeringizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects triggeringizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/triggeringizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('routingizability rollout integration', () => {
  it('reports routingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/routingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRoutingizabilityRollout: true,
      supportsRoutingizabilityAdminTools: true,
      supportsProviderCredentialRoutingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/routingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns routingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/routingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        routingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects routingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/routingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('balancingizability rollout integration', () => {
  it('reports balancingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/balancingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsBalancingizabilityRollout: true,
      supportsBalancingizabilityAdminTools: true,
      supportsModelHealthBalancingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/balancingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns balancingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/balancingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        balancingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects balancingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/balancingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('nodelizability rollout integration', () => {
  it('reports nodelizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/nodelizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNodelizabilityRollout: true,
      supportsNodelizabilityAdminTools: true,
      supportsShieldScanNodelizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/nodelizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns nodelizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/nodelizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        nodelizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects nodelizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/nodelizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('coordinationizability rollout integration', () => {
  it('reports coordinationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/coordinationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCoordinationizabilityRollout: true,
      supportsCoordinationizabilityAdminTools: true,
      supportsIdempotencyKeyCoordinationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/coordinationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns coordinationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/coordinationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        coordinationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects coordinationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/coordinationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('partitioningizability rollout integration', () => {
  it('reports partitioningizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/partitioningizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPartitioningizabilityRollout: true,
      supportsPartitioningizabilityAdminTools: true,
      supportsMembershipPartitioningizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/partitioningizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns partitioningizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/partitioningizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        partitioningizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects partitioningizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/partitioningizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('clusteringizability rollout integration', () => {
  it('reports clusteringizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/clusteringizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsClusteringizabilityRollout: true,
      supportsClusteringizabilityAdminTools: true,
      supportsBillingInvoiceClusteringizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/clusteringizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns clusteringizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/clusteringizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        clusteringizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects clusteringizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/clusteringizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('meshingizability rollout integration', () => {
  it('reports meshingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/meshingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMeshingizabilityRollout: true,
      supportsMeshingizabilityAdminTools: true,
      supportsBillingNotificationMeshingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/meshingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns meshingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/meshingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        meshingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects meshingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/meshingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('discoveryizability rollout integration', () => {
  it('reports discoveryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/discoveryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiscoveryizabilityRollout: true,
      supportsDiscoveryizabilityAdminTools: true,
      supportsBillingWebhookDiscoveryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/discoveryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns discoveryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/discoveryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        discoveryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects discoveryizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/discoveryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('registrationizability rollout integration', () => {
  it('reports registrationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/registrationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegistrationizabilityRollout: true,
      supportsRegistrationizabilityAdminTools: true,
      supportsMeterUsageRegistrationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/registrationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns registrationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/registrationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        registrationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects registrationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/registrationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('provisioningizability rollout integration', () => {
  it('reports provisioningizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/provisioningizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProvisioningizabilityRollout: true,
      supportsProvisioningizabilityAdminTools: true,
      supportsWorkspaceLimitProvisioningizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/provisioningizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns provisioningizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/provisioningizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        provisioningizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects provisioningizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/provisioningizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('allocationizability rollout integration', () => {
  it('reports allocationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/allocationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAllocationizabilityRollout: true,
      supportsAllocationizabilityAdminTools: true,
      supportsProviderCredentialAllocationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/allocationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns allocationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/allocationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        allocationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects allocationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/allocationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('deallocationizability rollout integration', () => {
  it('reports deallocationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/deallocationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDeallocationizabilityRollout: true,
      supportsDeallocationizabilityAdminTools: true,
      supportsModelHealthDeallocationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/deallocationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns deallocationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/deallocationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        deallocationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects deallocationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/deallocationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('scalingizability rollout integration', () => {
  it('reports scalingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/scalingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsScalingizabilityRollout: true,
      supportsScalingizabilityAdminTools: true,
      supportsBillingInvoiceScalingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/scalingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns scalingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/scalingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        scalingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects scalingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/scalingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('healingizability rollout integration', () => {
  it('reports healingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/healingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHealingizabilityRollout: true,
      supportsHealingizabilityAdminTools: true,
      supportsMembershipHealingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/healingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns healingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/healingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        healingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects healingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/healingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('remediationizability rollout integration', () => {
  it('reports remediationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/remediationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRemediationizabilityRollout: true,
      supportsRemediationizabilityAdminTools: true,
      supportsIdempotencyKeyRemediationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/remediationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns remediationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/remediationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        remediationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects remediationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/remediationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reconciliationizability rollout integration', () => {
  it('reports reconciliationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/reconciliationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReconciliationizabilityRollout: true,
      supportsReconciliationizabilityAdminTools: true,
      supportsShieldScanReconciliationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/reconciliationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reconciliationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/reconciliationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        reconciliationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reconciliationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/reconciliationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('governanceizability rollout integration', () => {
  it('reports governanceizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/governanceizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGovernanceizabilityRollout: true,
      supportsGovernanceizabilityAdminTools: true,
      supportsBillingNotificationGovernanceizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/governanceizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns governanceizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/governanceizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        governanceizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects governanceizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/governanceizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('complianceizability rollout integration', () => {
  it('reports complianceizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/complianceizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComplianceizabilityRollout: true,
      supportsComplianceizabilityAdminTools: true,
      supportsBillingInvoiceComplianceizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/complianceizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns complianceizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/complianceizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        complianceizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects complianceizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/complianceizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('policyizability rollout integration', () => {
  it('reports policyizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/policyizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPolicyizabilityRollout: true,
      supportsPolicyizabilityAdminTools: true,
      supportsMembershipPolicyizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/policyizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns policyizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/policyizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        policyizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects policyizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/policyizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('enforcementizability rollout integration', () => {
  it('reports enforcementizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/enforcementizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEnforcementizabilityRollout: true,
      supportsEnforcementizabilityAdminTools: true,
      supportsIdempotencyKeyEnforcementizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/enforcementizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns enforcementizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/enforcementizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        enforcementizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects enforcementizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/enforcementizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('assuranceizability rollout integration', () => {
  it('reports assuranceizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/assuranceizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssuranceizabilityRollout: true,
      supportsAssuranceizabilityAdminTools: true,
      supportsShieldScanAssuranceizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/assuranceizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assuranceizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/assuranceizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        assuranceizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects assuranceizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/assuranceizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('attestationizability rollout integration', () => {
  it('reports attestationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attestationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttestationizabilityRollout: true,
      supportsAttestationizabilityAdminTools: true,
      supportsBillingNotificationAttestationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attestationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attestationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/attestationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attestationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects attestationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/attestationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('certificationizability rollout integration', () => {
  it('reports certificationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/certificationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCertificationizabilityRollout: true,
      supportsCertificationizabilityAdminTools: true,
      supportsBillingInvoiceCertificationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/certificationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns certificationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/certificationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        certificationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects certificationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/certificationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('accreditationizability rollout integration', () => {
  it('reports accreditationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/accreditationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAccreditationizabilityRollout: true,
      supportsAccreditationizabilityAdminTools: true,
      supportsMembershipAccreditationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/accreditationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns accreditationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/accreditationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        accreditationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects accreditationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/accreditationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('specificationizability rollout integration', () => {
  it('reports specificationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/specificationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSpecificationizabilityRollout: true,
      supportsSpecificationizabilityAdminTools: true,
      supportsIdempotencyKeySpecificationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/specificationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns specificationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/specificationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        specificationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects specificationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/specificationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('instrumentationizability rollout integration', () => {
  it('reports instrumentationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/instrumentationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInstrumentationizabilityRollout: true,
      supportsInstrumentationizabilityAdminTools: true,
      supportsShieldScanInstrumentationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/instrumentationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns instrumentationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/instrumentationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        instrumentationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects instrumentationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/instrumentationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('telemetryizability rollout integration', () => {
  it('reports telemetryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/telemetryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTelemetryizabilityRollout: true,
      supportsTelemetryizabilityAdminTools: true,
      supportsBillingNotificationTelemetryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/telemetryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns telemetryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/telemetryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        telemetryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects telemetryizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/telemetryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('auditingizability rollout integration', () => {
  it('reports auditingizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditingizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditingizabilityRollout: true,
      supportsAuditingizabilityAdminTools: true,
      supportsBillingInvoiceAuditingizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditingizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditingizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auditingizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditingizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditingizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/auditingizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('accountabilityizability rollout integration', () => {
  it('reports accountabilityizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/accountabilityizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAccountabilityizabilityRollout: true,
      supportsAccountabilityizabilityAdminTools: true,
      supportsMembershipAccountabilityizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/accountabilityizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns accountabilityizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/accountabilityizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        accountabilityizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects accountabilityizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/accountabilityizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('transparencyizability rollout integration', () => {
  it('reports transparencyizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/transparencyizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTransparencyizabilityRollout: true,
      supportsTransparencyizabilityAdminTools: true,
      supportsIdempotencyKeyTransparencyizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/transparencyizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns transparencyizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transparencyizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        transparencyizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects transparencyizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/transparencyizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('oversightizability rollout integration', () => {
  it('reports oversightizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/oversightizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsOversightizabilityRollout: true,
      supportsOversightizabilityAdminTools: true,
      supportsShieldScanOversightizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/oversightizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns oversightizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/oversightizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        oversightizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects oversightizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/oversightizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('controlizability rollout integration', () => {
  it('reports controlizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/controlizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsControlizabilityRollout: true,
      supportsControlizabilityAdminTools: true,
      supportsBillingNotificationControlizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/controlizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns controlizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/controlizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        controlizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects controlizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/controlizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('entitlementizability rollout integration', () => {
  it('reports entitlementizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/entitlementizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEntitlementizabilityRollout: true,
      supportsEntitlementizabilityAdminTools: true,
      supportsBillingInvoiceEntitlementizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/entitlementizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns entitlementizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/entitlementizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        entitlementizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects entitlementizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/entitlementizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('permissionizability rollout integration', () => {
  it('reports permissionizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/permissionizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPermissionizabilityRollout: true,
      supportsPermissionizabilityAdminTools: true,
      supportsMembershipPermissionizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/permissionizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns permissionizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/permissionizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        permissionizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects permissionizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/permissionizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('authorizationizability rollout integration', () => {
  it('reports authorizationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/authorizationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuthorizationizabilityRollout: true,
      supportsAuthorizationizabilityAdminTools: true,
      supportsIdempotencyKeyAuthorizationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/authorizationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns authorizationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/authorizationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        authorizationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects authorizationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/authorizationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('authenticationizability rollout integration', () => {
  it('reports authenticationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/authenticationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuthenticationizabilityRollout: true,
      supportsAuthenticationizabilityAdminTools: true,
      supportsShieldScanAuthenticationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/authenticationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns authenticationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/authenticationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        authenticationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects authenticationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/authenticationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('identityizability rollout integration', () => {
  it('reports identityizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/identityizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIdentityizabilityRollout: true,
      supportsIdentityizabilityAdminTools: true,
      supportsBillingNotificationIdentityizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/identityizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns identityizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/identityizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        identityizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects identityizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/identityizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('riskizability rollout integration', () => {
  it('reports riskizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/riskizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRiskizabilityRollout: true,
      supportsRiskizabilityAdminTools: true,
      supportsBillingInvoiceRiskizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/riskizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns riskizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/riskizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        riskizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects riskizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/riskizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('securityizability rollout integration', () => {
  it('reports securityizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/securityizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSecurityizabilityRollout: true,
      supportsSecurityizabilityAdminTools: true,
      supportsMembershipSecurityizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/securityizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns securityizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/securityizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        securityizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects securityizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/securityizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('privacyizability rollout integration', () => {
  it('reports privacyizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/privacyizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPrivacyizabilityRollout: true,
      supportsPrivacyizabilityAdminTools: true,
      supportsIdempotencyKeyPrivacyizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/privacyizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns privacyizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/privacyizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        privacyizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects privacyizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/privacyizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('trustizability rollout integration', () => {
  it('reports trustizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/trustizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTrustizabilityRollout: true,
      supportsTrustizabilityAdminTools: true,
      supportsShieldScanTrustizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/trustizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns trustizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/trustizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        trustizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects trustizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/trustizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('integrityizability rollout integration', () => {
  it('reports integrityizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/integrityizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrityizabilityRollout: true,
      supportsIntegrityizabilityAdminTools: true,
      supportsBillingNotificationIntegrityizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/integrityizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrityizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/integrityizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        integrityizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects integrityizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/integrityizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('threatizability rollout integration', () => {
  it('reports threatizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/threatizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsThreatizabilityRollout: true,
      supportsThreatizabilityAdminTools: true,
      supportsBillingInvoiceThreatizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/threatizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns threatizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/threatizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        threatizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects threatizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/threatizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('vulnerabilityizability rollout integration', () => {
  it('reports vulnerabilityizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/vulnerabilityizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVulnerabilityizabilityRollout: true,
      supportsVulnerabilityizabilityAdminTools: true,
      supportsMembershipVulnerabilityizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/vulnerabilityizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns vulnerabilityizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/vulnerabilityizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        vulnerabilityizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects vulnerabilityizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/vulnerabilityizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('mitigationizability rollout integration', () => {
  it('reports mitigationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/mitigationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMitigationizabilityRollout: true,
      supportsMitigationizabilityAdminTools: true,
      supportsIdempotencyKeyMitigationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/mitigationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns mitigationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/mitigationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        mitigationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects mitigationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/mitigationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('hardeningizability rollout integration', () => {
  it('reports hardeningizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/hardeningizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsHardeningizabilityRollout: true,
      supportsHardeningizabilityAdminTools: true,
      supportsShieldScanHardeningizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/hardeningizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns hardeningizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/hardeningizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        hardeningizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects hardeningizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/hardeningizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('segregationizability rollout integration', () => {
  it('reports segregationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/segregationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSegregationizabilityRollout: true,
      supportsSegregationizabilityAdminTools: true,
      supportsBillingNotificationSegregationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/segregationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns segregationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/segregationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        segregationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects segregationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/segregationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('confidentialityizability rollout integration', () => {
  it('reports confidentialityizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/confidentialityizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsConfidentialityizabilityRollout: true,
      supportsConfidentialityizabilityAdminTools: true,
      supportsBillingInvoiceConfidentialityizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/confidentialityizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns confidentialityizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/confidentialityizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        confidentialityizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects confidentialityizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/confidentialityizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('nonrepudiationizability rollout integration', () => {
  it('reports nonrepudiationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/nonrepudiationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNonrepudiationizabilityRollout: true,
      supportsNonrepudiationizabilityAdminTools: true,
      supportsMembershipNonrepudiationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/nonrepudiationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns nonrepudiationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/nonrepudiationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        nonrepudiationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects nonrepudiationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/nonrepudiationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('accesscontrolizability rollout integration', () => {
  it('reports accesscontrolizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/accesscontrolizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAccesscontrolizabilityRollout: true,
      supportsAccesscontrolizabilityAdminTools: true,
      supportsIdempotencyKeyAccesscontrolizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/accesscontrolizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns accesscontrolizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/accesscontrolizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        accesscontrolizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects accesscontrolizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/accesscontrolizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('leastprivilegeizability rollout integration', () => {
  it('reports leastprivilegeizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/leastprivilegeizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLeastprivilegeizabilityRollout: true,
      supportsLeastprivilegeizabilityAdminTools: true,
      supportsShieldScanLeastprivilegeizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/leastprivilegeizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns leastprivilegeizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/leastprivilegeizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        leastprivilegeizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects leastprivilegeizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/leastprivilegeizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('zerotrustizability rollout integration', () => {
  it('reports zerotrustizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/zerotrustizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsZerotrustizabilityRollout: true,
      supportsZerotrustizabilityAdminTools: true,
      supportsBillingNotificationZerotrustizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/zerotrustizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns zerotrustizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/zerotrustizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        zerotrustizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects zerotrustizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/zerotrustizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('identityproofizability rollout integration', () => {
  it('reports identityproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/identityproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIdentityproofizabilityRollout: true,
      supportsIdentityproofizabilityAdminTools: true,
      supportsBillingInvoiceIdentityproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/identityproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns identityproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/identityproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        identityproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects identityproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/identityproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('keymanagementizability rollout integration', () => {
  it('reports keymanagementizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/keymanagementizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsKeymanagementizabilityRollout: true,
      supportsKeymanagementizabilityAdminTools: true,
      supportsMembershipKeymanagementizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/keymanagementizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns keymanagementizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/keymanagementizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        keymanagementizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects keymanagementizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/keymanagementizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('secretmanagementizability rollout integration', () => {
  it('reports secretmanagementizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/secretmanagementizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSecretmanagementizabilityRollout: true,
      supportsSecretmanagementizabilityAdminTools: true,
      supportsIdempotencyKeySecretmanagementizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/secretmanagementizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns secretmanagementizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/secretmanagementizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        secretmanagementizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects secretmanagementizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/secretmanagementizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('cryptographyizability rollout integration', () => {
  it('reports cryptographyizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/cryptographyizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCryptographyizabilityRollout: true,
      supportsCryptographyizabilityAdminTools: true,
      supportsShieldScanCryptographyizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/cryptographyizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns cryptographyizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/cryptographyizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        cryptographyizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects cryptographyizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/cryptographyizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('complianceguardizability rollout integration', () => {
  it('reports complianceguardizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/complianceguardizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComplianceguardizabilityRollout: true,
      supportsComplianceguardizabilityAdminTools: true,
      supportsBillingNotificationComplianceguardizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/complianceguardizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns complianceguardizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/complianceguardizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        complianceguardizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects complianceguardizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/complianceguardizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('provenanceizability rollout integration', () => {
  it('reports provenanceizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/provenanceizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProvenanceizabilityRollout: true,
      supportsProvenanceizabilityAdminTools: true,
      supportsBillingInvoiceProvenanceizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/provenanceizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns provenanceizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/provenanceizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        provenanceizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects provenanceizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/provenanceizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('lineageizability rollout integration', () => {
  it('reports lineageizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/lineageizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLineageizabilityRollout: true,
      supportsLineageizabilityAdminTools: true,
      supportsMembershipLineageizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/lineageizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns lineageizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/lineageizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        lineageizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects lineageizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/lineageizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('forensicizability rollout integration', () => {
  it('reports forensicizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/forensicizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsForensicizabilityRollout: true,
      supportsForensicizabilityAdminTools: true,
      supportsIdempotencyKeyForensicizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/forensicizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns forensicizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/forensicizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        forensicizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects forensicizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/forensicizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('audittrailizability rollout integration', () => {
  it('reports audittrailizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/audittrailizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAudittrailizabilityRollout: true,
      supportsAudittrailizabilityAdminTools: true,
      supportsShieldScanAudittrailizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/audittrailizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns audittrailizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/audittrailizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        audittrailizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects audittrailizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/audittrailizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('complianceproofizability rollout integration', () => {
  it('reports complianceproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/complianceproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComplianceproofizabilityRollout: true,
      supportsComplianceproofizabilityAdminTools: true,
      supportsBillingNotificationComplianceproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/complianceproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns complianceproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/complianceproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        complianceproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects complianceproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/complianceproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('governancetrackizability rollout integration', () => {
  it('reports governancetrackizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/governancetrackizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsGovernancetrackizabilityRollout: true,
      supportsGovernancetrackizabilityAdminTools: true,
      supportsBillingInvoiceGovernancetrackizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/governancetrackizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns governancetrackizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/governancetrackizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        governancetrackizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects governancetrackizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/governancetrackizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('attesttrackizability rollout integration', () => {
  it('reports attesttrackizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attesttrackizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttesttrackizabilityRollout: true,
      supportsAttesttrackizabilityAdminTools: true,
      supportsMembershipAttesttrackizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attesttrackizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attesttrackizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/attesttrackizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attesttrackizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects attesttrackizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/attesttrackizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('evidencizability rollout integration', () => {
  it('reports evidencizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/evidencizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEvidencizabilityRollout: true,
      supportsEvidencizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/evidencizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns evidencizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/evidencizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        evidencizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects evidencizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/evidencizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('chainofcustodyizability rollout integration', () => {
  it('reports chainofcustodyizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/chainofcustodyizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsChainofcustodyizabilityRollout: true,
      supportsChainofcustodyizabilityAdminTools: true,
      supportsShieldScanChainofcustodyizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/chainofcustodyizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns chainofcustodyizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/chainofcustodyizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        chainofcustodyizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects chainofcustodyizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/chainofcustodyizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tamperproofizability rollout integration', () => {
  it('reports tamperproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/tamperproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTamperproofizabilityRollout: true,
      supportsTamperproofizabilityAdminTools: true,
      supportsBillingNotificationTamperproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/tamperproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tamperproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/tamperproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        tamperproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects tamperproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/tamperproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('policyproofizability rollout integration', () => {
  it('reports policyproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/policyproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsPolicyproofizabilityRollout: true,
      supportsPolicyproofizabilityAdminTools: true,
      supportsBillingInvoicePolicyproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/policyproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns policyproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/policyproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        policyproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects policyproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/policyproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('notarizationizability rollout integration', () => {
  it('reports notarizationizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/notarizationizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNotarizationizabilityRollout: true,
      supportsNotarizationizabilityAdminTools: true,
      supportsMembershipNotarizationizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/notarizationizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns notarizationizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/notarizationizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        notarizationizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects notarizationizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/notarizationizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('witnessizability rollout integration', () => {
  it('reports witnessizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/witnessizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWitnessizabilityRollout: true,
      supportsWitnessizabilityAdminTools: true,
      supportsIdempotencyKeyWitnessizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/witnessizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns witnessizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/witnessizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        witnessizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects witnessizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/witnessizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('ledgerizability rollout integration', () => {
  it('reports ledgerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/ledgerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLedgerizabilityRollout: true,
      supportsLedgerizabilityAdminTools: true,
      supportsShieldScanLedgerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/ledgerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ledgerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ledgerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        ledgerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects ledgerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/ledgerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('signatureproofizability rollout integration', () => {
  it('reports signatureproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/signatureproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSignatureproofizabilityRollout: true,
      supportsSignatureproofizabilityAdminTools: true,
      supportsBillingNotificationSignatureproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/signatureproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns signatureproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/signatureproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        signatureproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects signatureproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/signatureproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('ruleproofizability rollout integration', () => {
  it('reports ruleproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/ruleproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRuleproofizabilityRollout: true,
      supportsRuleproofizabilityAdminTools: true,
      supportsBillingInvoiceRuleproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/ruleproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns ruleproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ruleproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        ruleproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects ruleproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/ruleproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('traceproofizability rollout integration', () => {
  it('reports traceproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/traceproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTraceproofizabilityRollout: true,
      supportsTraceproofizabilityAdminTools: true,
      supportsMembershipTraceproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/traceproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns traceproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/traceproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        traceproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects traceproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/traceproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('disclosureizability rollout integration', () => {
  it('reports disclosureizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/disclosureizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDisclosureizabilityRollout: true,
      supportsDisclosureizabilityAdminTools: true,
      supportsIdempotencyKeyDisclosureizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/disclosureizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns disclosureizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/disclosureizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        disclosureizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects disclosureizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/disclosureizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('registrarizability rollout integration', () => {
  it('reports registrarizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/registrarizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegistrarizabilityRollout: true,
      supportsRegistrarizabilityAdminTools: true,
      supportsShieldScanRegistrarizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/registrarizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns registrarizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/registrarizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        registrarizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects registrarizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/registrarizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('auditproofizability rollout integration', () => {
  it('reports auditproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditproofizabilityRollout: true,
      supportsAuditproofizabilityAdminTools: true,
      supportsBillingNotificationAuditproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auditproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/auditproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('compliancechainizability rollout integration', () => {
  it('reports compliancechainizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compliancechainizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompliancechainizabilityRollout: true,
      supportsCompliancechainizabilityAdminTools: true,
      supportsBillingInvoiceCompliancechainizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compliancechainizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compliancechainizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/compliancechainizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compliancechainizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compliancechainizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/compliancechainizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('attestledgerizability rollout integration', () => {
  it('reports attestledgerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attestledgerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttestledgerizabilityRollout: true,
      supportsAttestledgerizabilityAdminTools: true,
      supportsMembershipAttestledgerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attestledgerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attestledgerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/attestledgerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attestledgerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects attestledgerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/attestledgerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('evidencetrackizability rollout integration', () => {
  it('reports evidencetrackizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/evidencetrackizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEvidencetrackizabilityRollout: true,
      supportsEvidencetrackizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencetrackizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/evidencetrackizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns evidencetrackizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/evidencetrackizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        evidencetrackizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects evidencetrackizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/evidencetrackizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('prooflineizability rollout integration', () => {
  it('reports prooflineizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/prooflineizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProoflineizabilityRollout: true,
      supportsProoflineizabilityAdminTools: true,
      supportsShieldScanProoflineizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/prooflineizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns prooflineizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/prooflineizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        prooflineizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects prooflineizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/prooflineizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('notarproofizability rollout integration', () => {
  it('reports notarproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/notarproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNotarproofizabilityRollout: true,
      supportsNotarproofizabilityAdminTools: true,
      supportsBillingNotificationNotarproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/notarproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns notarproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/notarproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        notarproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects notarproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/notarproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('auditlineizability rollout integration', () => {
  it('reports auditlineizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditlineizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditlineizabilityRollout: true,
      supportsAuditlineizabilityAdminTools: true,
      supportsBillingInvoiceAuditlineizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditlineizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditlineizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auditlineizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditlineizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditlineizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/auditlineizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('traceledgerizability rollout integration', () => {
  it('reports traceledgerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/traceledgerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTraceledgerizabilityRollout: true,
      supportsTraceledgerizabilityAdminTools: true,
      supportsMembershipTraceledgerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/traceledgerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns traceledgerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/traceledgerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        traceledgerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects traceledgerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/traceledgerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('disclosureproofizability rollout integration', () => {
  it('reports disclosureproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/disclosureproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDisclosureproofizabilityRollout: true,
      supportsDisclosureproofizabilityAdminTools: true,
      supportsIdempotencyKeyDisclosureproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/disclosureproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns disclosureproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/disclosureproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        disclosureproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects disclosureproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/disclosureproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('registrarproofizability rollout integration', () => {
  it('reports registrarproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/registrarproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegistrarproofizabilityRollout: true,
      supportsRegistrarproofizabilityAdminTools: true,
      supportsShieldScanRegistrarproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/registrarproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns registrarproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/registrarproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        registrarproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects registrarproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/registrarproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('witnessproofizability rollout integration', () => {
  it('reports witnessproofizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/witnessproofizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWitnessproofizabilityRollout: true,
      supportsWitnessproofizabilityAdminTools: true,
      supportsBillingNotificationWitnessproofizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/witnessproofizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns witnessproofizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/witnessproofizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        witnessproofizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects witnessproofizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/witnessproofizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('complianceledgerizability rollout integration', () => {
  it('reports complianceledgerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/complianceledgerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComplianceledgerizabilityRollout: true,
      supportsComplianceledgerizabilityAdminTools: true,
      supportsBillingInvoiceComplianceledgerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/complianceledgerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns complianceledgerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/complianceledgerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        complianceledgerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects complianceledgerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/complianceledgerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('notarledgerizability rollout integration', () => {
  it('reports notarledgerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/notarledgerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNotarledgerizabilityRollout: true,
      supportsNotarledgerizabilityAdminTools: true,
      supportsMembershipNotarledgerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/notarledgerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns notarledgerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/notarledgerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        notarledgerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects notarledgerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/notarledgerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('witnessledgerizability rollout integration', () => {
  it('reports witnessledgerizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/witnessledgerizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWitnessledgerizabilityRollout: true,
      supportsWitnessledgerizabilityAdminTools: true,
      supportsIdempotencyKeyWitnessledgerizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/witnessledgerizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns witnessledgerizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/witnessledgerizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        witnessledgerizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects witnessledgerizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/witnessledgerizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('proofregistryizability rollout integration', () => {
  it('reports proofregistryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/proofregistryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProofregistryizabilityRollout: true,
      supportsProofregistryizabilityAdminTools: true,
      supportsShieldScanProofregistryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/proofregistryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns proofregistryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/proofregistryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        proofregistryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects proofregistryizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/proofregistryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('auditregistryizability rollout integration', () => {
  it('reports auditregistryizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditregistryizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditregistryizabilityRollout: true,
      supportsAuditregistryizabilityAdminTools: true,
      supportsBillingNotificationAuditregistryizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditregistryizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditregistryizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auditregistryizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditregistryizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditregistryizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/auditregistryizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('compliancejournalizability rollout integration', () => {
  it('reports compliancejournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compliancejournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompliancejournalizabilityRollout: true,
      supportsCompliancejournalizabilityAdminTools: true,
      supportsBillingInvoiceCompliancejournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compliancejournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compliancejournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/compliancejournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compliancejournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compliancejournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/compliancejournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('notarjournalizability rollout integration', () => {
  it('reports notarjournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/notarjournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNotarjournalizabilityRollout: true,
      supportsNotarjournalizabilityAdminTools: true,
      supportsMembershipNotarjournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/notarjournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns notarjournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/notarjournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        notarjournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects notarjournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/notarjournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('witnessjournalizability rollout integration', () => {
  it('reports witnessjournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/witnessjournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWitnessjournalizabilityRollout: true,
      supportsWitnessjournalizabilityAdminTools: true,
      supportsIdempotencyKeyWitnessjournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/witnessjournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns witnessjournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/witnessjournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        witnessjournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects witnessjournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/witnessjournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('proofjournalizability rollout integration', () => {
  it('reports proofjournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/proofjournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProofjournalizabilityRollout: true,
      supportsProofjournalizabilityAdminTools: true,
      supportsShieldScanProofjournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/proofjournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns proofjournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/proofjournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        proofjournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects proofjournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/proofjournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('auditjournalizability rollout integration', () => {
  it('reports auditjournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditjournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditjournalizabilityRollout: true,
      supportsAuditjournalizabilityAdminTools: true,
      supportsBillingNotificationAuditjournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditjournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditjournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auditjournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditjournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditjournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/auditjournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('registryjournalizability rollout integration', () => {
  it('reports registryjournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/registryjournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegistryjournalizabilityRollout: true,
      supportsRegistryjournalizabilityAdminTools: true,
      supportsBillingInvoiceRegistryjournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/registryjournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns registryjournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/registryjournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        registryjournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects registryjournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/registryjournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tracejournalizability rollout integration', () => {
  it('reports tracejournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/tracejournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTracejournalizabilityRollout: true,
      supportsTracejournalizabilityAdminTools: true,
      supportsMembershipTracejournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/tracejournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tracejournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/tracejournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        tracejournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects tracejournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/tracejournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('evidencejournalizability rollout integration', () => {
  it('reports evidencejournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/evidencejournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEvidencejournalizabilityRollout: true,
      supportsEvidencejournalizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencejournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/evidencejournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns evidencejournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/evidencejournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        evidencejournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects evidencejournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/evidencejournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('attestjournalizability rollout integration', () => {
  it('reports attestjournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attestjournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttestjournalizabilityRollout: true,
      supportsAttestjournalizabilityAdminTools: true,
      supportsShieldScanAttestjournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attestjournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attestjournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/attestjournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attestjournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects attestjournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/attestjournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('integrityjournalizability rollout integration', () => {
  it('reports integrityjournalizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/integrityjournalizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIntegrityjournalizabilityRollout: true,
      supportsIntegrityjournalizabilityAdminTools: true,
      supportsBillingNotificationIntegrityjournalizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/integrityjournalizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns integrityjournalizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/integrityjournalizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        integrityjournalizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects integrityjournalizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/integrityjournalizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('registryvaultizability rollout integration', () => {
  it('reports registryvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/registryvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRegistryvaultizabilityRollout: true,
      supportsRegistryvaultizabilityAdminTools: true,
      supportsBillingInvoiceRegistryvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/registryvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns registryvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/registryvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        registryvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects registryvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/registryvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('tracevaultizability rollout integration', () => {
  it('reports tracevaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/tracevaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsTracevaultizabilityRollout: true,
      supportsTracevaultizabilityAdminTools: true,
      supportsMembershipTracevaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/tracevaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns tracevaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/tracevaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        tracevaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects tracevaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/tracevaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('evidencevaultizability rollout integration', () => {
  it('reports evidencevaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/evidencevaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsEvidencevaultizabilityRollout: true,
      supportsEvidencevaultizabilityAdminTools: true,
      supportsIdempotencyKeyEvidencevaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/evidencevaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns evidencevaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/evidencevaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        evidencevaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects evidencevaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/evidencevaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('auditvaultizability rollout integration', () => {
  it('reports auditvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditvaultizabilityRollout: true,
      supportsAuditvaultizabilityAdminTools: true,
      supportsShieldScanAuditvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auditvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/auditvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('compliancevaultizability rollout integration', () => {
  it('reports compliancevaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/compliancevaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCompliancevaultizabilityRollout: true,
      supportsCompliancevaultizabilityAdminTools: true,
      supportsBillingNotificationCompliancevaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/compliancevaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns compliancevaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/compliancevaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        compliancevaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects compliancevaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/compliancevaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('validityvaultizability rollout integration', () => {
  it('reports validityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/validityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsValidityvaultizabilityRollout: true,
      supportsValidityvaultizabilityAdminTools: true,
      supportsBillingInvoiceValidityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/validityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns validityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/validityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        validityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects validityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/validityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('authenticityvaultizability rollout integration', () => {
  it('reports authenticityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/authenticityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuthenticityvaultizabilityRollout: true,
      supportsAuthenticityvaultizabilityAdminTools: true,
      supportsMembershipAuthenticityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/authenticityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns authenticityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/authenticityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        authenticityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects authenticityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/authenticityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('provenancevaultizability rollout integration', () => {
  it('reports provenancevaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/provenancevaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsProvenancevaultizabilityRollout: true,
      supportsProvenancevaultizabilityAdminTools: true,
      supportsIdempotencyKeyProvenancevaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/provenancevaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns provenancevaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/provenancevaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        provenancevaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects provenancevaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/provenancevaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('verificationvaultizability rollout integration', () => {
  it('reports verificationvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/verificationvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsVerificationvaultizabilityRollout: true,
      supportsVerificationvaultizabilityAdminTools: true,
      supportsShieldScanVerificationvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/verificationvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns verificationvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/verificationvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        verificationvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects verificationvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/verificationvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('attestationvaultizability rollout integration', () => {
  it('reports attestationvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attestationvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttestationvaultizabilityRollout: true,
      supportsAttestationvaultizabilityAdminTools: true,
      supportsBillingNotificationAttestationvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attestationvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attestationvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/attestationvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attestationvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects attestationvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/attestationvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('assurancevaultizability rollout integration', () => {
  it('reports assurancevaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/assurancevaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssurancevaultizabilityRollout: true,
      supportsAssurancevaultizabilityAdminTools: true,
      supportsBillingInvoiceAssurancevaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/assurancevaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assurancevaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/assurancevaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        assurancevaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects assurancevaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/assurancevaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('auditabilityvaultizability rollout integration', () => {
  it('reports auditabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/auditabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAuditabilityvaultizabilityRollout: true,
      supportsAuditabilityvaultizabilityAdminTools: true,
      supportsMembershipAuditabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/auditabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns auditabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auditabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        auditabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects auditabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/auditabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('inspectabilityvaultizability rollout integration', () => {
  it('reports inspectabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/inspectabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsInspectabilityvaultizabilityRollout: true,
      supportsInspectabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyInspectabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/inspectabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns inspectabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/inspectabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        inspectabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects inspectabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/inspectabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reproducibilityvaultizability rollout integration', () => {
  it('reports reproducibilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/reproducibilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReproducibilityvaultizabilityRollout: true,
      supportsReproducibilityvaultizabilityAdminTools: true,
      supportsShieldScanReproducibilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/reproducibilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reproducibilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/reproducibilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        reproducibilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reproducibilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/reproducibilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('credibilityvaultizability rollout integration', () => {
  it('reports credibilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/credibilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCredibilityvaultizabilityRollout: true,
      supportsCredibilityvaultizabilityAdminTools: true,
      supportsBillingNotificationCredibilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/credibilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns credibilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/credibilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        credibilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects credibilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/credibilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('defensibilityvaultizability rollout integration', () => {
  it('reports defensibilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/defensibilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDefensibilityvaultizabilityRollout: true,
      supportsDefensibilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceDefensibilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/defensibilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns defensibilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/defensibilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        defensibilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects defensibilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/defensibilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('explainabilityvaultizability rollout integration', () => {
  it('reports explainabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/explainabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsExplainabilityvaultizabilityRollout: true,
      supportsExplainabilityvaultizabilityAdminTools: true,
      supportsMembershipExplainabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/explainabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns explainabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/explainabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        explainabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects explainabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/explainabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('demonstrabilityvaultizability rollout integration', () => {
  it('reports demonstrabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/demonstrabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDemonstrabilityvaultizabilityRollout: true,
      supportsDemonstrabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyDemonstrabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/demonstrabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns demonstrabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/demonstrabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        demonstrabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects demonstrabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/demonstrabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('justifiabilityvaultizability rollout integration', () => {
  it('reports justifiabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/justifiabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsJustifiabilityvaultizabilityRollout: true,
      supportsJustifiabilityvaultizabilityAdminTools: true,
      supportsShieldScanJustifiabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/justifiabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns justifiabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/justifiabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        justifiabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects justifiabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/justifiabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('reviewabilityvaultizability rollout integration', () => {
  it('reports reviewabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/reviewabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReviewabilityvaultizabilityRollout: true,
      supportsReviewabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationReviewabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/reviewabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns reviewabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/reviewabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        reviewabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reviewabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/reviewabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('assessabilityvaultizability rollout integration', () => {
  it('reports assessabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/assessabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssessabilityvaultizabilityRollout: true,
      supportsAssessabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceAssessabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/assessabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assessabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/assessabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        assessabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects assessabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/assessabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('measurabilityvaultizability rollout integration', () => {
  it('reports measurabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/measurabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsMeasurabilityvaultizabilityRollout: true,
      supportsMeasurabilityvaultizabilityAdminTools: true,
      supportsMembershipMeasurabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/measurabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns measurabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/measurabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        measurabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects measurabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/measurabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('certifiabilityvaultizability rollout integration', () => {
  it('reports certifiabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/certifiabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsCertifiabilityvaultizabilityRollout: true,
      supportsCertifiabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyCertifiabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/certifiabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns certifiabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/certifiabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        certifiabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects certifiabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/certifiabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('substantiabilityvaultizability rollout integration', () => {
  it('reports substantiabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/substantiabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsSubstantiabilityvaultizabilityRollout: true,
      supportsSubstantiabilityvaultizabilityAdminTools: true,
      supportsShieldScanSubstantiabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/substantiabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns substantiabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/substantiabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        substantiabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects substantiabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/substantiabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('warrantabilityvaultizability rollout integration', () => {
  it('reports warrantabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/warrantabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsWarrantabilityvaultizabilityRollout: true,
      supportsWarrantabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationWarrantabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/warrantabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns warrantabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/warrantabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        warrantabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects warrantabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/warrantabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('attributabilityvaultizability rollout integration', () => {
  it('reports attributabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/attributabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAttributabilityvaultizabilityRollout: true,
      supportsAttributabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceAttributabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/attributabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns attributabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/attributabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        attributabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects attributabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/attributabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('identifiabilityvaultizability rollout integration', () => {
  it('reports identifiabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/identifiabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsIdentifiabilityvaultizabilityRollout: true,
      supportsIdentifiabilityvaultizabilityAdminTools: true,
      supportsMembershipIdentifiabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/identifiabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns identifiabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/identifiabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        identifiabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects identifiabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/identifiabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('comparabilityvaultizability rollout integration', () => {
  it('reports comparabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/comparabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsComparabilityvaultizabilityRollout: true,
      supportsComparabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyComparabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/comparabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns comparabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/comparabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        comparabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects comparabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/comparabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('distinguishabilityvaultizability rollout integration', () => {
  it('reports distinguishabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/distinguishabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDistinguishabilityvaultizabilityRollout: true,
      supportsDistinguishabilityvaultizabilityAdminTools: true,
      supportsShieldScanDistinguishabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/distinguishabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns distinguishabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/distinguishabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        distinguishabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects distinguishabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/distinguishabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('assignabilityvaultizability rollout integration', () => {
  it('reports assignabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/assignabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsAssignabilityvaultizabilityRollout: true,
      supportsAssignabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationAssignabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/assignabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns assignabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/assignabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        assignabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects assignabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/assignabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
describe('referencabilityvaultizability rollout integration', () => {
  it('reports referencabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/referencabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsReferencabilityvaultizabilityRollout: true,
      supportsReferencabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceReferencabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/referencabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns referencabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/referencabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        referencabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects referencabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/referencabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('locatabilityvaultizability rollout integration', () => {
  it('reports locatabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/locatabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsLocatabilityvaultizabilityRollout: true,
      supportsLocatabilityvaultizabilityAdminTools: true,
      supportsMembershipLocatabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/locatabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns locatabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/locatabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        locatabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects locatabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/locatabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('retrievabilityvaultizability rollout integration', () => {
  it('reports retrievabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/retrievabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsRetrievabilityvaultizabilityRollout: true,
      supportsRetrievabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyRetrievabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/retrievabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns retrievabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/retrievabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        retrievabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects retrievabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/retrievabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('discoverabilityvaultizability rollout integration', () => {
  it('reports discoverabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/discoverabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsDiscoverabilityvaultizabilityRollout: true,
      supportsDiscoverabilityvaultizabilityAdminTools: true,
      supportsShieldScanDiscoverabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/discoverabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns discoverabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/discoverabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        discoverabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects discoverabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/discoverabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})


describe('navigabilityvaultizability rollout integration', () => {
  it('reports navigabilityvaultizability capabilities and rollout readiness', async () => {
    const capabilities = await request(app.getHttpServer())
      .get('/api/navigabilityvaultizability/capabilities')
      .expect(200)

    expect(capabilities.body).toMatchObject({
      supportsNavigabilityvaultizabilityRollout: true,
      supportsNavigabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationNavigabilityvaultizabilitySignals: true,
    })

    const rollout = await request(app.getHttpServer())
      .get('/api/navigabilityvaultizability/readiness')
      .expect(200)

    expect(rollout.body.status).toBe('ready')
  })

  it('returns navigabilityvaultizability admin summary for owners', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/navigabilityvaultizability/workspace/workspace_1/admin')
      .set(authHeaders)
      .expect(200)

    expect(response.body).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
        coveredDomains: expect.any(Number),
        navigabilityvaultizabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects navigabilityvaultizability admin tools for members', async () => {
    await request(app.getHttpServer())
      .get('/api/navigabilityvaultizability/workspace/workspace_1/admin')
      .set({
        'x-user-id': 'user_member',
        'x-workspace-id': 'workspace_1',
      })
      .expect(403)
  })
})
