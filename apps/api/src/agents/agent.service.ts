import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  type AgentExecutionResult,
  type AgentOutput,
  type AgentRole,
  type DraftRun,
  agentExecutionResultSchema,
  agentOutputSchema,
} from '@ai-war-room/schemas'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { agentPrompts } from '../prompts/agent.prompts.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class AgentService {
  constructor(private readonly llmGatewayService: LlmGatewayService) {}

  async executeAgent(input: {
    runId: string
    agentRole: Exclude<AgentRole, 'moderator'>
    draftRun: DraftRun
    completedAt: string
  }): Promise<AgentExecutionResult> {
    const prompt = agentPrompts[input.agentRole]
    const fallback = this.createFallbackAgentOutput(input.agentRole, input.draftRun)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: agentOutputSchema,
      messages: [
        {
          role: 'system',
          content: prompt.system,
        },
        {
          role: 'user',
          content: `${prompt.userTemplate}${JSON.stringify({
            draftRun: input.draftRun,
            role: input.agentRole,
          })}`,
        },
      ],
      fallback,
    })

    return agentExecutionResultSchema.parse({
      runId: input.runId,
      agentRole: input.agentRole,
      output: result.value,
      validationStatus: result.validationStatus,
      promptVersion: prompt.version,
      modelProvider: result.providerId,
      modelName: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      estimatedCostUsd: result.usage.estimatedCostUsd,
      shieldScan: {
        scanId: createId('scan'),
        status: 'clear',
        maxSeverity: 'none',
        findings: [],
      },
      completedAt: input.completedAt,
    })
  }

  private createFallbackAgentOutput(
    agentRole: Exclude<AgentRole, 'moderator'>,
    draftRun: DraftRun,
  ): AgentOutput {
    const idea = draftRun.idea.rawIdea
    const targetAudience = draftRun.idea.targetAudience ?? 'early adopters'

    return {
      summary: `${this.formatRole(agentRole)} fallback review for "${idea}" targeting ${targetAudience}.`,
      strengths: [
        'The workflow is structured and schema-first.',
        'Human review protects the expensive execution path.',
      ],
      weaknesses: [
        'This fallback output was generated after gateway validation failure.',
      ],
      risks: ['The model response did not satisfy the expected schema.'],
      recommendations: [
        'Review prompt version and validation error logs before using this output.',
      ],
      roleSpecificInsights: {
        role: agentRole,
        fallback: true,
      },
    }
  }

  private formatRole(role: string) {
    return role
      .split('_')
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(' ')
  }
}
