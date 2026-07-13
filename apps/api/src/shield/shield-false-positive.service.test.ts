import { describe, expect, it } from 'vitest'
import { ShieldFalsePositiveService } from './shield-false-positive.service.js'

function createService() {
  const configService = {
    get: () => 'test',
  }
  const postgresService = {
    query: async () => ({ rows: [] }),
  }
  const observabilityService = {
    record: () => undefined,
  }

  return new ShieldFalsePositiveService(
    configService as never,
    postgresService as never,
    observabilityService as never,
  )
}

const baseScan = {
  scanId: 'scan_1',
  status: 'warning' as const,
  maxSeverity: 'high' as const,
  findings: [
    {
      findingId: 'finding_high_1',
      severity: 'high' as const,
      category: 'prompt_injection' as const,
      source: 'user_input' as const,
      explanation: 'Looks like injection but may be discussing the topic.',
      recommendedAction: 'warn' as const,
    },
    {
      findingId: 'finding_critical_1',
      severity: 'critical' as const,
      category: 'secrets' as const,
      source: 'user_input' as const,
      explanation: 'Possible secret material.',
      recommendedAction: 'block' as const,
    },
  ],
}

describe('ShieldFalsePositiveService', () => {
  it('records an open report for non-critical findings', async () => {
    const service = createService()
    const report = await service.createReport({
      runId: 'run_1',
      authContext: {
        userId: 'user_1',
        workspaceId: 'workspace_1',
        role: 'member',
      },
      body: {
        findingId: 'finding_high_1',
        note: 'Benign discussion of prompt injection.',
        shieldScan: baseScan,
      },
    })

    expect(report.status).toBe('open')
    expect(report.severity).toBe('high')
    expect(report.category).toBe('prompt_injection')

    const listed = await service.listWorkspaceReports(
      {
        userId: 'user_admin',
        workspaceId: 'workspace_1',
        role: 'admin',
      },
      'workspace_1',
    )
    expect(listed.openCount).toBe(1)
    expect(listed.reports[0]?.reportId).toBe(report.reportId)
  })

  it('rejects critical findings so override remains the only unlock path', async () => {
    const service = createService()

    await expect(
      service.createReport({
        runId: 'run_1',
        authContext: {
          userId: 'user_1',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        body: {
          findingId: 'finding_critical_1',
          shieldScan: {
            ...baseScan,
            status: 'blocked',
            maxSeverity: 'critical',
          },
        },
      }),
    ).rejects.toMatchObject({
      response: {
        message: expect.stringMatching(/override/i),
      },
    })
  })

  it('lets owners accept open reports into the triage queue', async () => {
    const service = createService()
    const created = await service.createReport({
      runId: 'run_1',
      authContext: {
        userId: 'user_1',
        workspaceId: 'workspace_1',
        role: 'member',
      },
      body: {
        findingId: 'finding_high_1',
        note: 'Benign discussion of prompt injection.',
        shieldScan: baseScan,
      },
    })

    const resolved = await service.resolveReport({
      authContext: {
        userId: 'user_admin',
        workspaceId: 'workspace_1',
        role: 'admin',
      },
      workspaceId: 'workspace_1',
      reportId: created.reportId,
      body: {
        decision: 'accepted',
        note: 'Confirmed benign.',
      },
    })

    expect(resolved.status).toBe('accepted')
    expect(resolved.reviewedByUserId).toBe('user_admin')
    expect(resolved.reviewNote).toBe('Confirmed benign.')

    const listed = await service.listWorkspaceReports(
      {
        userId: 'user_admin',
        workspaceId: 'workspace_1',
        role: 'admin',
      },
      'workspace_1',
    )
    expect(listed.openCount).toBe(0)
  })
})
