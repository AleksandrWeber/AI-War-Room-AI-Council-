import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  type AgentChunkSummary,
  type AgentExecutionResult,
  agentChunkSummaryListSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import type { LlmUsage } from '../llm/llm.types.js'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { chunkSummaryPromptV1 } from '../prompts/chunk-summary.prompts.js'

const MAX_ITEMS = 5

export type ChunkSummaryResult = {
  summaries: AgentChunkSummary[]
  llmUsage: {
    providerId: string
    modelName: string
    promptVersion: string
    usage: LlmUsage
  } | null
}

/**
 * Spec Step 9: deterministic map-reduce compression before Moderator.
 * Optional LLM pass when payload exceeds CHUNK_SUMMARY_LLM_MIN_CHARS.
 */
@Injectable()
export class ChunkSummaryService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly llmGatewayService: LlmGatewayService,
  ) {}

  async summarizeAgentOutputs(input: {
    agentOutputs: AgentExecutionResult[]
    workspaceId?: string
  }): Promise<ChunkSummaryResult> {
    const deterministic = this.buildDeterministic(input.agentOutputs)
    const payloadSize = JSON.stringify(input.agentOutputs).length
    const llmEnabled = this.configService.get('CHUNK_SUMMARY_LLM_ENABLED', {
      infer: true,
    })
    const minChars = this.configService.get('CHUNK_SUMMARY_LLM_MIN_CHARS', {
      infer: true,
    })

    if (!llmEnabled || payloadSize < minChars) {
      return { summaries: deterministic, llmUsage: null }
    }

    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: chunkSummaryPromptV1.version,
      schema: agentChunkSummaryListSchema,
      workspaceId: input.workspaceId,
      messages: [
        {
          role: 'system',
          content: chunkSummaryPromptV1.system,
        },
        {
          role: 'user',
          content: `${chunkSummaryPromptV1.userTemplate}${JSON.stringify({
            agentOutputs: input.agentOutputs.map((agent) => ({
              agentRole: agent.agentRole,
              output: agent.output,
              shieldScan: agent.shieldScan,
            })),
          })}`,
        },
      ],
      fallback: deterministic,
      maxAttempts: 2,
    })

    if (result.validationStatus === 'fallback') {
      return { summaries: result.value, llmUsage: null }
    }

    return {
      summaries: result.value,
      llmUsage: {
        providerId: result.providerId,
        modelName: result.model,
        promptVersion: chunkSummaryPromptV1.version,
        usage: result.usage,
      },
    }
  }

  private buildDeterministic(
    agentOutputs: AgentExecutionResult[],
  ): AgentChunkSummary[] {
    const summaries = agentOutputs.map((agent) => {
      const securityNotes =
        agent.shieldScan?.findings
          .filter(
            (finding) =>
              finding.severity === 'high' || finding.severity === 'critical',
          )
          .map((finding) => `${finding.category}: ${finding.explanation}`)
          .slice(0, MAX_ITEMS) ?? []

      const weaknesses = agent.output.weaknesses.slice(0, 3)
      const strengths = agent.output.strengths.slice(0, 3)
      const conflicts =
        weaknesses.length > 0 && strengths.length > 0
          ? [
              `${agent.agentRole}: strengths emphasize ${strengths[0]}; weaknesses note ${weaknesses[0]}`,
            ]
          : []

      return {
        agentRole: agent.agentRole,
        summary: agent.output.summary,
        topInsights: [...strengths, ...agent.output.recommendations].slice(
          0,
          MAX_ITEMS,
        ),
        topRisks: agent.output.risks.slice(0, MAX_ITEMS),
        conflicts,
        recommendedDecisions: agent.output.recommendations.slice(0, MAX_ITEMS),
        securityNotes,
      }
    })

    return agentChunkSummaryListSchema.parse(summaries)
  }
}
