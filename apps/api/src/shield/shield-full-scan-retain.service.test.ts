import { describe, expect, it, vi } from 'vitest'
import type { DraftRun } from '@ai-war-room/schemas'
import { ShieldFullScanRetainService } from './shield-full-scan-retain.service.js'

function createService(input?: {
  enabled?: boolean
  hours?: number
  paidTier?: 'free' | 'pro' | 'business'
}) {
  const configService = {
    get: (key: string) => {
      if (key === 'NODE_ENV') {
        return 'test'
      }
      if (key === 'SHIELD_FULL_SCAN_RETAIN_ENABLED') {
        return input?.enabled ?? true
      }
      if (key === 'SHIELD_FULL_SCAN_RETAIN_HOURS') {
        return input?.hours ?? 72
      }
      return undefined
    },
  }
  const postgresService = {
    query: async () => ({ rows: [] }),
  }
  const observabilityService = {
    record: vi.fn(),
  }
  const usageRepository = {
    getWorkspaceLimit: async () => ({
      workspaceId: 'workspace_1',
      paidTier: input?.paidTier ?? 'business',
      dailyTokenLimit: 1_000_000,
      dailyCostLimitUsd: 50,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
  }

  return {
    service: new ShieldFullScanRetainService(
      configService as never,
      postgresService as never,
      observabilityService as never,
      usageRepository as never,
    ),
    observabilityService,
  }
}

function createDraft(overrides?: Partial<DraftRun['shieldScan']>): DraftRun {
  return {
    runId: 'run_1',
    workspaceId: 'workspace_1',
    status: 'draft',
    idea: {
      rawIdea: 'Ship with sk-test-secret-value-here for disputes.',
      strategicGoals: [],
      technicalPreferences: [],
      constraints: [],
      references: [],
    },
    shieldScan: {
      scanId: 'scan_1',
      status: 'warning',
      maxSeverity: 'high',
      findings: [
        {
          findingId: 'finding_secret_1',
          severity: 'high',
          category: 'secrets',
          source: 'user_input',
          explanation: 'Contains sk-test-secret-value-here',
          recommendedAction: 'redact',
          span: {
            start: 10,
            end: 34,
            quote: 'sk-test-secret-value-here',
          },
        },
      ],
      ...overrides,
    },
    triage: {
      domain: 'saas',
      subdomain: 'planning',
      complexity: 'low',
      marketConfidence: 'medium',
      securitySensitivity: 'high',
      recommendedRunMode: 'standard',
      recommendedAgents: ['product_manager', 'critic', 'moderator'],
      estimatedDurationSeconds: 60,
      estimatedMaxCostUsd: 0.5,
      reasoningSummary: 'test',
    },
    selectedAgents: ['product_manager', 'critic', 'moderator'],
    estimatedDurationSeconds: 60,
    estimatedMaxCostUsd: 0.5,
    createdAt: '2026-07-13T00:00:00.000Z',
    updatedAt: '2026-07-13T00:00:00.000Z',
  }
}

describe('ShieldFullScanRetainService', () => {
  it('retains unredacted secrets for business workspaces when enabled', async () => {
    const { service } = createService()
    const draft = createDraft()
    await service.maybeRetainFullScan(draft)

    const dispute = await service.getFullScanForDispute({
      authContext: {
        userId: 'user_admin',
        workspaceId: 'workspace_1',
        role: 'admin',
      },
      workspaceId: 'workspace_1',
      scanId: 'scan_1',
    })

    expect(dispute.findings[0]?.span?.quote).toBe('sk-test-secret-value-here')
    expect(dispute.retainUntil).toBe('2026-07-16T00:00:00.000Z')
  })

  it('skips retain for free tier workspaces', async () => {
    const { service } = createService({ paidTier: 'free' })
    await service.maybeRetainFullScan(createDraft())

    await expect(
      service.getFullScanForDispute({
        authContext: {
          userId: 'user_admin',
          workspaceId: 'workspace_1',
          role: 'admin',
        },
        workspaceId: 'workspace_1',
        scanId: 'scan_1',
      }),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('redacts expired retain records on purge', async () => {
    const { service } = createService({ hours: 0 })
    await service.maybeRetainFullScan(createDraft())

    const purge = await service.purgeExpired('workspace_1')
    expect(purge.purgedCount).toBe(1)

    await expect(
      service.getFullScanForDispute({
        authContext: {
          userId: 'user_admin',
          workspaceId: 'workspace_1',
          role: 'admin',
        },
        workspaceId: 'workspace_1',
        scanId: 'scan_1',
      }),
    ).rejects.toMatchObject({ status: 404 })
  })
})
