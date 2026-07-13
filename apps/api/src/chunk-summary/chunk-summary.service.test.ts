import { describe, expect, it } from 'vitest'
import type { AgentExecutionResult } from '@ai-war-room/schemas'
import { ChunkSummaryService } from './chunk-summary.service.js'

const agentOutput = (
  overrides: Partial<AgentExecutionResult> & {
    agentRole: AgentExecutionResult['agentRole']
  },
): AgentExecutionResult => {
  const {
    output: outputOverrides,
    agentRole,
    ...rest
  } = overrides

  return {
    runId: 'run_1',
    agentRole,
    output: {
      summary: `${agentRole} summary`,
      strengths: ['Strong structure'],
      weaknesses: ['Needs validation'],
      risks: ['Scope creep'],
      recommendations: ['Keep schemas strict'],
      roleSpecificInsights: {},
      ...outputOverrides,
    },
    validationStatus: 'valid',
    promptVersion: 'agents/product_manager/v1',
    modelProvider: 'mock',
    modelName: 'mock-json-v1',
    inputTokens: 10,
    outputTokens: 20,
    estimatedCostUsd: 0,
    completedAt: '2026-07-13T00:00:00.000Z',
    ...rest,
  }
}

describe('ChunkSummaryService', () => {
  it('compresses agent outputs into moderator chunk summaries', () => {
    const service = new ChunkSummaryService()
    const summaries = service.summarizeAgentOutputs([
      agentOutput({ agentRole: 'product_manager' }),
      agentOutput({
        agentRole: 'security_expert',
        shieldScan: {
          scanId: 'scan_1',
          status: 'warning',
          maxSeverity: 'high',
          findings: [
            {
              findingId: 'finding_1',
              severity: 'high',
              category: 'secrets',
              source: 'agent_output',
              explanation: 'Agent echoed a credential pattern.',
              recommendedAction: 'warn',
            },
          ],
        },
      }),
    ])

    expect(summaries).toHaveLength(2)
    expect(summaries[0]?.agentRole).toBe('product_manager')
    expect(summaries[0]?.topRisks).toEqual(['Scope creep'])
    expect(summaries[0]?.conflicts[0]).toContain('product_manager')
    expect(summaries[1]?.securityNotes[0]).toContain('secrets:')
  })
})
