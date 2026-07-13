import { Injectable } from '@nestjs/common'
import {
  type AgentChunkSummary,
  type AgentExecutionResult,
  type DraftRun,
  type ModeratorSynthesis,
  moderatorSynthesisSchema,
} from '@ai-war-room/schemas'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { moderatorPromptV1 } from '../prompts/moderator.prompts.js'

@Injectable()
export class ModeratorService {
  constructor(private readonly llmGatewayService: LlmGatewayService) {}

  async synthesize(input: {
    draftRun: DraftRun
    approvedTriage: DraftRun['triage']
    agentOutputs: AgentExecutionResult[]
    chunkSummaries: AgentChunkSummary[]
  }): Promise<ModeratorSynthesis> {
    const fallback = this.createFallbackSynthesis(input)
    const llmInput = {
      draftRun: input.draftRun,
      approvedTriage: input.approvedTriage,
      chunkSummaries: input.chunkSummaries,
      agentCount: input.agentOutputs.length,
    }
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: moderatorPromptV1.version,
      schema: moderatorSynthesisSchema,
      workspaceId: input.draftRun.workspaceId,
      messages: [
        {
          role: 'system',
          content: moderatorPromptV1.system,
        },
        {
          role: 'user',
          content: `${moderatorPromptV1.userTemplate}${JSON.stringify(llmInput)}`,
        },
      ],
      fallback,
    })

    return {
      ...result.value,
      artifactGenerationBrief: {
        ...result.value.artifactGenerationBrief,
        promptVersion: moderatorPromptV1.version,
        modelProvider: result.providerId,
        modelName: result.model,
        validationStatus: result.validationStatus,
        tokenUsage: result.usage,
      },
    }
  }

  private createFallbackSynthesis(input: {
    draftRun: DraftRun
    approvedTriage: DraftRun['triage']
    agentOutputs: AgentExecutionResult[]
    chunkSummaries: AgentChunkSummary[]
  }): ModeratorSynthesis {
    return {
      executivePositioning:
        'AI War Room converts raw product ideas into reviewed, build-ready artifacts through a controlled specialist pipeline.',
      targetUsers: [
        input.draftRun.idea.targetAudience ?? 'Founders',
        'Technical product builders',
      ],
      coreProblem:
        'Builders need a repeatable way to turn rough ideas into coherent product and implementation artifacts.',
      proposedSolution:
        'Run isolated specialists, synthesize their validated outputs, and generate artifacts only after human review.',
      mvpScope: [
        'Idea submission',
        'Shield input scan',
        'Human Review Screen',
        'Prompt-driven isolated agent analysis',
        'Moderator synthesis',
        'Executive Summary, PRD, and Development Prompt',
      ],
      nonGoals: [
        'Custom user-defined agents',
        'Agent marketplace',
        'Open-ended multi-agent chat',
      ],
      keyDecisions: [
        `Use ${input.approvedTriage.recommendedRunMode} run mode for this draft.`,
        `Execute ${input.agentOutputs.length} non-moderator agents in isolation.`,
        'Keep Shield as a background security layer.',
      ],
      risks: input.chunkSummaries
        .flatMap((summary) => summary.topRisks)
        .slice(0, 10),
      openQuestions: [
        'Which artifact format should users export first?',
        'What quality signal proves that a generated development prompt is build-ready?',
      ],
      artifactGenerationBrief: {
        promptVersion: moderatorPromptV1.version,
        validationStatus: 'fallback',
        source: 'moderator_fallback',
        chunkSummaryCount: input.chunkSummaries.length,
      },
    }
  }
}
