import { HttpException, Injectable } from '@nestjs/common'
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
import { ResearchService } from '../research/research.service.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class AgentService {
  constructor(
    private readonly llmGatewayService: LlmGatewayService,
    private readonly researchService: ResearchService,
  ) {}

  async executeAgent(input: {
    runId: string
    agentRole: Exclude<AgentRole, 'moderator'>
    draftRun: DraftRun
    completedAt: string
  }): Promise<AgentExecutionResult> {
    const prompt = agentPrompts[input.agentRole]
    let researchContext: Awaited<
      ReturnType<ResearchService['createResearchContext']>
    > | null = null
    let researchDegradedMessage: string | null = null

    if (input.agentRole === 'market_researcher') {
      try {
        researchContext = await this.researchService.createResearchContext({
          workspaceId: input.draftRun.workspaceId,
          draftRun: input.draftRun,
        })
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }

        researchDegradedMessage =
          error instanceof Error
            ? `Live research unavailable (${error.message}). Continuing without external research.`
            : 'Live research unavailable. Continuing without external research.'
      }
    }

    const fallback = this.createFallbackAgentOutput(input.agentRole, input.draftRun)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: agentOutputSchema,
      workspaceId: input.draftRun.workspaceId,
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
            researchContext,
            researchDegradedMessage,
          })}`,
        },
      ],
      fallback,
    })
    let output =
      researchContext && input.agentRole === 'market_researcher'
        ? this.attachResearchCitations(result.value, researchContext)
        : result.value

    if (researchDegradedMessage && input.agentRole === 'market_researcher') {
      output = {
        ...output,
        roleSpecificInsights: {
          ...output.roleSpecificInsights,
          researchDegraded: true,
          researchDegradedMessage,
        },
      }
    }

    return agentExecutionResultSchema.parse({
      runId: input.runId,
      agentRole: input.agentRole,
      output,
      validationStatus: result.validationStatus,
      promptVersion: prompt.version,
      modelProvider: result.providerId,
      modelName: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      estimatedCostUsd: result.usage.estimatedCostUsd,
      shieldScan: researchContext?.shieldScan ?? {
        scanId: createId('scan'),
        status: 'clear',
        maxSeverity: 'none',
        findings: [],
      },
      completedAt: input.completedAt,
    })
  }

  private attachResearchCitations(
    output: AgentOutput,
    researchContext: Awaited<ReturnType<ResearchService['createResearchContext']>>,
  ): AgentOutput {
    return {
      ...output,
      roleSpecificInsights: {
        ...output.roleSpecificInsights,
        researchProvider: researchContext.providerId,
        researchCitations: researchContext.citations,
        researchDocuments: researchContext.documents,
        researchShieldStatus: researchContext.shieldScan.status,
        researchFindingCount: researchContext.shieldScan.findings.length,
      },
    }
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
