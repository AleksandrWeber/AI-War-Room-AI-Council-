import { describe, expect, it } from 'vitest'
import {
  artifactSchema,
  createRunRequestSchema,
  draftRunSchema,
  authContextSchema,
  shieldScanResultSchema,
  usageEventSchema,
  workspaceUsageLimitSchema,
  workspaceMembershipSchema,
} from './index.js'

const now = '2026-07-04T12:00:00.000Z'

describe('pipeline schemas', () => {
  it('validates a create run request', () => {
    const result = createRunRequestSchema.safeParse({
      workspaceId: 'workspace_1',
      idempotencyKey: 'idem_1',
      idea: {
        rawIdea: 'Build an AI planning engine for founders.',
        targetAudience: 'Indie hackers',
        strategicGoals: ['Create PRDs faster'],
        technicalPreferences: ['TypeScript'],
        constraints: ['MVP first'],
        references: ['https://vite.dev/'],
      },
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty raw ideas', () => {
    const result = createRunRequestSchema.safeParse({
      workspaceId: 'workspace_1',
      idempotencyKey: 'idem_1',
      idea: {
        rawIdea: '   ',
      },
    })

    expect(result.success).toBe(false)
  })

  it('validates a clear Shield result', () => {
    const result = shieldScanResultSchema.safeParse({
      scanId: 'scan_1',
      status: 'clear',
      maxSeverity: 'none',
      findings: [],
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid Shield finding severities', () => {
    const result = shieldScanResultSchema.safeParse({
      scanId: 'scan_1',
      status: 'warning',
      maxSeverity: 'medium',
      findings: [
        {
          findingId: 'finding_1',
          severity: 'none',
          category: 'prompt_injection',
          source: 'user_input',
          explanation: 'Invalid severity for an actual finding.',
          recommendedAction: 'warn',
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  it('validates a draft run with triage and selected agents', () => {
    const result = draftRunSchema.safeParse({
      runId: 'run_1',
      workspaceId: 'workspace_1',
      status: 'draft',
      idea: {
        rawIdea: 'AI War Room for product planning.',
      },
      shieldScan: {
        scanId: 'scan_1',
        status: 'clear',
        maxSeverity: 'none',
        findings: [],
      },
      triage: {
        domain: 'software',
        subdomain: 'SaaS planning',
        complexity: 'medium',
        marketConfidence: 'medium',
        securitySensitivity: 'medium',
        recommendedRunMode: 'standard',
        recommendedAgents: ['product_manager', 'critic', 'moderator'],
        estimatedDurationSeconds: 60,
        estimatedMaxCostUsd: 0.5,
        reasoningSummary: 'Standard SaaS product planning run.',
      },
      selectedAgents: ['product_manager', 'critic', 'moderator'],
      estimatedDurationSeconds: 60,
      estimatedMaxCostUsd: 0.5,
      createdAt: now,
      updatedAt: now,
    })

    expect(result.success).toBe(true)
  })

  it('validates an idea brief artifact', () => {
    const result = artifactSchema.safeParse({
      metadata: {
        artifactId: 'artifact_1',
        runId: 'run_1',
        workspaceId: 'workspace_1',
        artifactType: 'idea_brief',
        artifactVersion: 'v1',
        promptVersion: 'artifacts/idea_brief/v1',
        modelProvider: 'mock',
        modelName: 'mock-model',
        tokenUsage: {
          inputTokens: 100,
          outputTokens: 200,
        },
        estimatedCostUsd: 0,
        validationStatus: 'valid',
        shieldStatus: 'clear',
        createdAt: now,
      },
      artifact: {
        artifactType: 'idea_brief',
        content: {
          summaryForUser: 'Expanded idea for discussion.',
          expandedIdea: 'Build an AI planning engine.',
          analysis: 'Keep the council pipeline; clarify tools before build.',
          acceptRecommendations: ['Keep schema-validated agent outputs'],
          applyRecommendations: ['Add screen inventory before coding'],
          toolsToUse: [
            {
              name: 'Vite + React',
              why: 'Fast local UI development',
              required: true,
            },
          ],
          aiChoices: [
            {
              name: 'Cursor',
              role: 'Implementation',
              why: 'File-scoped coding against the master prompt',
            },
          ],
          openQuestions: ['Confirm auth provider'],
        },
      },
    })

    expect(result.success).toBe(true)
  })

  it('validates workspace membership and auth context', () => {
    expect(
      workspaceMembershipSchema.safeParse({
        workspaceId: 'workspace_1',
        userId: 'user_1',
        role: 'owner',
        createdAt: now,
      }).success,
    ).toBe(true)
    expect(
      authContextSchema.safeParse({
        workspaceId: 'workspace_1',
        userId: 'user_1',
        role: 'member',
      }).success,
    ).toBe(true)
  })

  it('validates usage events and workspace usage limits', () => {
    expect(
      usageEventSchema.safeParse({
        usageEventId: 'usage_1',
        workspaceId: 'workspace_1',
        userId: 'user_1',
        runId: 'run_1',
        phase: 'agent',
        sourceId: 'product_manager',
        modelProvider: 'mock',
        modelName: 'mock-json-v1',
        promptVersion: 'agents/product_manager/v1',
        inputTokens: 100,
        outputTokens: 200,
        estimatedCostUsd: 0.01,
        createdAt: now,
      }).success,
    ).toBe(true)
    expect(
      workspaceUsageLimitSchema.safeParse({
        workspaceId: 'workspace_1',
        paidTier: 'free',
        dailyTokenLimit: 250000,
        dailyCostLimitUsd: 25,
        createdAt: now,
        updatedAt: now,
      }).success,
    ).toBe(true)
  })
})
