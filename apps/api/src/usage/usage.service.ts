import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  billingWorkspaceUsageResponseSchema,
  usageAdminActionRequestSchema,
  usageAdminActionResponseSchema,
  usageAdminSummaryResponseSchema,
  usageCapabilitiesResponseSchema,
  PAID_TIER_LIMITS,
  type AuthContext,
  type MockPipelineResult,
  type UsageEvent,
  type UsagePhase,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildUsageAdminStats,
  getUsageAdminGuidance,
  resolveUsageAdminActions,
} from './usage-admin.helpers.js'
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
    private readonly configService: ConfigService<ApiEnv, true>,
    @Inject(USAGE_REPOSITORY)
    private readonly usageRepository: UsageRepository,
  ) {}

  getCapabilities() {
    return usageCapabilitiesResponseSchema.parse({
      supportsUsageSummary: true,
      supportsUsageAdminTools: true,
      guidance:
        'Workspace usage summaries and admin tools are available for owners and admins.',
    })
  }

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

  async getDailyUsageMetrics(workspaceId: string) {
    return this.usageRepository.getDailyUsageMetrics(workspaceId)
  }

  async listRecentUsageEvents(workspaceId: string) {
    return this.usageRepository.listWorkspaceUsageEvents(workspaceId, 20)
  }

  async getWorkspaceUsageSummary(workspaceId: string) {
    const limit = await this.usageRepository.getWorkspaceLimit(workspaceId)
    const usage = await this.usageRepository.getDailyUsageTotal(workspaceId)
    const now = new Date()
    const usagePeriodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )
    const usagePeriodEnd = new Date(usagePeriodStart)
    usagePeriodEnd.setUTCDate(usagePeriodEnd.getUTCDate() + 1)

    const resolvedLimit = limit ?? {
      workspaceId,
      paidTier: 'free' as const,
      dailyTokenLimit: PAID_TIER_LIMITS.free.dailyTokenLimit,
      dailyCostLimitUsd: PAID_TIER_LIMITS.free.dailyCostLimitUsd,
      createdAt: usagePeriodStart.toISOString(),
      updatedAt: usagePeriodStart.toISOString(),
    }

    return billingWorkspaceUsageResponseSchema.parse({
      workspaceId,
      paidTier: resolvedLimit.paidTier,
      dailyTokenLimit: resolvedLimit.dailyTokenLimit,
      dailyCostLimitUsd: resolvedLimit.dailyCostLimitUsd,
      dailyUsage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.inputTokens + usage.outputTokens,
        estimatedCostUsd: usage.estimatedCostUsd,
      },
      usagePeriodStart: usagePeriodStart.toISOString(),
      usagePeriodEnd: usagePeriodEnd.toISOString(),
    })
  }

  async getWorkspaceUsageAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageUsageAdmin(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const [usage, metrics] = await Promise.all([
      this.getWorkspaceUsageSummary(workspaceId),
      this.usageRepository.getDailyUsageMetrics(workspaceId),
    ])

    const availableActions = resolveUsageAdminActions({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      dailyEventCount: metrics.dailyEventCount,
    })

    return usageAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      usage,
      stats: buildUsageAdminStats({
        usage,
        dailyEventCount: metrics.dailyEventCount,
        distinctRunCount: metrics.distinctRunCount,
      }),
      availableActions,
      guidance: getUsageAdminGuidance({
        role: authContext.role,
        availableActions,
      }),
    })
  }

  async executeUsageAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'reset_daily_usage'
    },
  ) {
    this.assertCanManageUsageAdmin(authContext)

    const payload = usageAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'reset_daily_usage': {
        if (this.configService.get('NODE_ENV', { infer: true }) === 'production') {
          throw new BadRequestException({
            message: 'Reset daily usage is not available in production.',
          })
        }

        await this.usageRepository.resetDailyUsage(payload.workspaceId)
        const usage = await this.getWorkspaceUsageSummary(payload.workspaceId)

        return usageAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: 'Daily workspace usage counters were reset for local testing.',
          usage,
        })
      }
    }
  }

  async assertWorkspaceCanUseResearch(workspaceId: string): Promise<void> {
    const limit = await this.usageRepository.getWorkspaceLimit(workspaceId)

    if (!limit || limit.paidTier === 'free') {
      throw new ForbiddenException({
        message: 'Market Research Agent requires a paid or verified workspace tier.',
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

  private assertCanManageUsageAdmin(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage usage settings.',
    })
  }
}
