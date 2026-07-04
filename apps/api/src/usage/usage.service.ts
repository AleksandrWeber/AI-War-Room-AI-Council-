import {
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type {
  AuthContext,
  MockPipelineResult,
  UsageEvent,
  UsagePhase,
} from '@ai-war-room/schemas'
import {
  USAGE_REPOSITORY,
  type UsageRepository,
} from './usage.repository.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class UsageService {
  constructor(
    @Inject(USAGE_REPOSITORY)
    private readonly usageRepository: UsageRepository,
  ) {}

  async assertWorkspaceCanExecute(input: {
    workspaceId: string
    estimatedMaxCostUsd: number
  }): Promise<void> {
    const limit = await this.usageRepository.getWorkspaceLimit(input.workspaceId)

    if (!limit) {
      return
    }

    const usage = await this.usageRepository.getDailyUsageTotal(input.workspaceId)

    if (usage.estimatedCostUsd + input.estimatedMaxCostUsd > limit.dailyCostLimitUsd) {
      throw new ForbiddenException({
        message: 'Workspace daily cost quota exceeded.',
      })
    }
  }

  async recordPipelineUsage(input: {
    authContext?: AuthContext
    result: MockPipelineResult
  }): Promise<UsageEvent[]> {
    if (!input.authContext) {
      return []
    }

    const createdAt = input.result.completedAt
    const events: UsageEvent[] = []

    for (const agentOutput of input.result.agentOutputs) {
      events.push({
        usageEventId: createId('usage'),
        workspaceId: input.result.workspaceId,
        userId: input.authContext.userId,
        runId: input.result.runId,
        phase: 'agent',
        sourceId: agentOutput.agentRole,
        modelProvider: agentOutput.modelProvider,
        modelName: agentOutput.modelName,
        promptVersion: agentOutput.promptVersion,
        inputTokens: agentOutput.inputTokens,
        outputTokens: agentOutput.outputTokens,
        estimatedCostUsd: agentOutput.estimatedCostUsd,
        createdAt,
      })
    }

    const moderatorUsage = input.result.moderatorSynthesis.artifactGenerationBrief
      .tokenUsage as
      | {
          inputTokens?: number
          outputTokens?: number
          estimatedCostUsd?: number
        }
      | undefined
    events.push({
      usageEventId: createId('usage'),
      workspaceId: input.result.workspaceId,
      userId: input.authContext.userId,
      runId: input.result.runId,
      phase: 'moderator',
      sourceId: 'moderator',
      modelProvider: String(
        input.result.moderatorSynthesis.artifactGenerationBrief.modelProvider ??
          'unknown',
      ),
      modelName: String(
        input.result.moderatorSynthesis.artifactGenerationBrief.modelName ??
          'unknown',
      ),
      promptVersion: String(
        input.result.moderatorSynthesis.artifactGenerationBrief.promptVersion ??
          'moderator/unknown',
      ),
      inputTokens: moderatorUsage?.inputTokens ?? 0,
      outputTokens: moderatorUsage?.outputTokens ?? 0,
      estimatedCostUsd: moderatorUsage?.estimatedCostUsd ?? 0,
      createdAt,
    })

    for (const artifact of input.result.artifacts) {
      events.push({
        usageEventId: createId('usage'),
        workspaceId: input.result.workspaceId,
        userId: input.authContext.userId,
        runId: input.result.runId,
        phase: artifact.metadata.artifactType as UsagePhase,
        sourceId: artifact.metadata.artifactId,
        modelProvider: artifact.metadata.modelProvider,
        modelName: artifact.metadata.modelName,
        promptVersion: artifact.metadata.promptVersion,
        inputTokens: artifact.metadata.tokenUsage.inputTokens,
        outputTokens: artifact.metadata.tokenUsage.outputTokens,
        estimatedCostUsd: artifact.metadata.estimatedCostUsd,
        createdAt,
      })
    }

    await this.usageRepository.recordUsageEvents(events)

    return events
  }
}
