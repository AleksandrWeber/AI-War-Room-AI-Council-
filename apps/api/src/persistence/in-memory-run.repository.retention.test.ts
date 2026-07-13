import { describe, expect, it } from 'vitest'
import { InMemoryRunRepository } from './in-memory-run.repository.js'

describe('InMemoryRunRepository idempotency retention', () => {
  it('purges only expired idempotency keys', async () => {
    const repository = new InMemoryRunRepository()
    const draft = {
      runId: 'run_live',
      workspaceId: 'workspace_1',
      status: 'draft' as const,
      idea: {
        rawIdea: 'Ship retention cleanup for expired idempotency keys.',
        strategicGoals: [],
        technicalPreferences: [],
        constraints: [],
        references: [],
      },
      shieldScan: {
        scanId: 'scan_1',
        status: 'clear' as const,
        maxSeverity: 'none' as const,
        findings: [],
      },
      triage: {
        domain: 'saas',
        subdomain: 'Retention',
        complexity: 'low' as const,
        marketConfidence: 'medium' as const,
        securitySensitivity: 'low' as const,
        recommendedRunMode: 'standard' as const,
        recommendedAgents: [
          'product_manager',
          'critic',
          'moderator',
        ] as const,
        estimatedDurationSeconds: 60,
        estimatedMaxCostUsd: 0.5,
        reasoningSummary: 'Retention cleanup path.',
      },
      selectedAgents: [
        'product_manager',
        'critic',
        'moderator',
      ] as const,
      estimatedDurationSeconds: 60,
      estimatedMaxCostUsd: 0.5,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }

    await repository.saveDraftRun({
      draftRun: draft,
      idempotencyKey: 'idem_live',
      idempotencyTtlSeconds: 3_600,
    })
    await repository.saveDraftRun({
      draftRun: {
        ...draft,
        runId: 'run_expired',
      },
      idempotencyKey: 'idem_expired',
      idempotencyTtlSeconds: 0,
    })

    await expect(
      repository.purgeExpiredIdempotencyKeys('workspace_1'),
    ).resolves.toBe(1)
    await expect(
      repository.findDraftRunByIdempotencyKey('workspace_1', 'idem_live'),
    ).resolves.toMatchObject({ runId: 'run_live' })
    await expect(
      repository.findDraftRunByIdempotencyKey('workspace_1', 'idem_expired'),
    ).resolves.toBeNull()
  })
})
