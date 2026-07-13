import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import type { AgentExecutionResult } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ChunkSummaryService } from './chunk-summary.service.js'

const agentOutput = (
  overrides: Partial<AgentExecutionResult> & {
    agentRole: AgentExecutionResult['agentRole']
  },
): AgentExecutionResult => {
  const { output: outputOverrides, agentRole, ...rest } = overrides

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

function createService(env: Partial<ApiEnv> = {}) {
  const llmGatewayService = {
    generateStructuredJson: vi.fn(async ({ fallback }: { fallback: unknown }) => ({
      value: fallback,
      validationStatus: 'fallback',
      providerId: 'mock',
      model: 'mock-json-v1',
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    })),
  }

  return {
    service: new ChunkSummaryService(
      new ConfigService<ApiEnv>({
        CHUNK_SUMMARY_LLM_ENABLED: false,
        CHUNK_SUMMARY_LLM_MIN_CHARS: 4_000,
        ...env,
      }),
      llmGatewayService as never,
    ),
    llmGatewayService,
  }
}

describe('ChunkSummaryService', () => {
  it('compresses agent outputs deterministically by default', async () => {
    const { service, llmGatewayService } = createService()
    const summaries = await service.summarizeAgentOutputs({
      agentOutputs: [
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
      ],
    })

    expect(summaries.summaries).toHaveLength(2)
    expect(summaries.summaries[0]?.agentRole).toBe('product_manager')
    expect(summaries.summaries[0]?.topRisks).toEqual(['Scope creep'])
    expect(summaries.summaries[0]?.conflicts[0]).toContain('product_manager')
    expect(summaries.summaries[1]?.securityNotes[0]).toContain('secrets:')
    expect(summaries.llmUsage).toBeNull()
    expect(llmGatewayService.generateStructuredJson).not.toHaveBeenCalled()
  })

  it('calls LLM when enabled and payload exceeds the threshold', async () => {
    const { service, llmGatewayService } = createService({
      CHUNK_SUMMARY_LLM_ENABLED: true,
      CHUNK_SUMMARY_LLM_MIN_CHARS: 10,
    })
    llmGatewayService.generateStructuredJson.mockImplementationOnce(
      async ({ fallback }: { fallback: unknown }) => ({
        value: fallback,
        validationStatus: 'valid',
        providerId: 'mock',
        model: 'mock-json-v1',
        usage: {
          inputTokens: 12,
          outputTokens: 8,
          totalTokens: 20,
          estimatedCostUsd: 0.002,
        },
      }),
    )

    const result = await service.summarizeAgentOutputs({
      workspaceId: 'workspace_1',
      agentOutputs: [agentOutput({ agentRole: 'critic' })],
    })

    expect(llmGatewayService.generateStructuredJson).toHaveBeenCalledOnce()
    expect(result.llmUsage?.usage.inputTokens).toBe(12)
  })
})
