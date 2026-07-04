import { describe, expect, it } from 'vitest'
import {
  artifactSchema,
  createRunRequestSchema,
  draftRunSchema,
  shieldScanResultSchema,
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

  it('validates an executive summary artifact', () => {
    const result = artifactSchema.safeParse({
      metadata: {
        artifactId: 'artifact_1',
        runId: 'run_1',
        workspaceId: 'workspace_1',
        artifactType: 'executive_summary',
        artifactVersion: 'v1',
        promptVersion: 'executive_summary/v1',
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
        artifactType: 'executive_summary',
        content: {
          productIdea: 'AI planning engine.',
          targetUsers: ['Founders'],
          coreValueProposition: 'Turn rough ideas into build-ready specs.',
          mainDifferentiator: 'Structured pipeline instead of chat.',
          mvpRecommendation: 'Build the local core pipeline first.',
          topRisks: ['Scope creep'],
          recommendation: 'go',
        },
      },
    })

    expect(result.success).toBe(true)
  })
})
