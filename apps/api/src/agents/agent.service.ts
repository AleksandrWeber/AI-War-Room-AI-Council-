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
import { truncateText } from '../llm/llm.utils.js'
import { agentPrompts } from '../prompts/agent.prompts.js'
import { ResearchService } from '../research/research.service.js'

const AGENT_PROMPT_IDEA_MAX_CHARS = 40_000
const AGENT_FALLBACK_IDEA_MAX_CHARS = 240

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
    const promptDraftRun = {
      ...input.draftRun,
      idea: {
        ...input.draftRun.idea,
        rawIdea: truncateText(
          input.draftRun.idea.rawIdea,
          AGENT_PROMPT_IDEA_MAX_CHARS,
        ),
      },
    }
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
            draftRun: promptDraftRun,
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
    const idea = truncateText(
      draftRun.idea.rawIdea,
      AGENT_FALLBACK_IDEA_MAX_CHARS,
    )
    const targetAudience = draftRun.idea.targetAudience ?? 'early adopters'

    return {
      summary: `${this.formatRole(agentRole)} produced a fallback breakdown for "${idea}" targeting ${targetAudience}. The live model response failed schema validation, so this output lists gaps, additions, MVP must-haves, and build notes that should still be reviewed before implementation.`,
      strengths: [
        'The workflow is structured and schema-first.',
        'Human review protects the expensive execution path.',
      ],
      weaknesses: [
        'This fallback output was generated after gateway validation failure.',
        'Depth and product-specific recommendations may be incomplete.',
      ],
      risks: ['The model response did not satisfy the expected schema.'],
      recommendations: [
        'Review prompt version and validation error logs before using this output.',
        'Re-run the agent after fixing provider or schema issues for a full breakdown.',
      ],
      ideaGaps: [
        'Live model gap analysis is unavailable in this fallback.',
        'Product-specific missing sections were not regenerated from the raw idea.',
      ],
      additions: [
        'Add an explicit MVP feature list to the idea brief.',
        'Add primary user journeys and success metrics before build.',
        'Add non-goals and constraints so implementers do not invent scope.',
      ],
      mustHaveFeatures: [
        'Core user-facing web screens for the primary journey.',
        'Persisted data model for the main entities in the idea.',
        'Basic auth or workspace isolation if multi-user access is required.',
      ],
      buildNotes: [
        'Treat this fallback as a planning scaffold, not a final implementation brief.',
        'Prefer regenerating agent output before trusting Development Prompt details.',
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
