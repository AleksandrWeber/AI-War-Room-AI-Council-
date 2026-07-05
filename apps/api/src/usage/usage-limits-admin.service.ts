import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  criticalUsageLimitTiers,
  getUsageLimitsRolloutGuidance,
  quotaAdminActionRequestSchema,
  quotaAdminActionResponseSchema,
  quotaAdminSummaryResponseSchema,
  usageLimitsCapabilitiesResponseSchema,
  usageLimitsRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildQuotaAdminStats,
  getQuotaAdminGuidance,
  resolveQuotaAdminActions,
  toQuotaAdminRecord,
} from './quota-admin.helpers.js'
import { evaluateUsageLimitsRollout } from './usage-limits-rollout.helpers.js'
import { UsageService } from './usage.service.js'

@Injectable()
export class UsageLimitsAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly usageService: UsageService,
  ) {}

  getCapabilities() {
    return usageLimitsCapabilitiesResponseSchema.parse({
      supportsUsageLimitsRollout: true,
      supportsQuotaAdminTools: true,
      supportsDailyCostQuotaEnforcement: true,
      supportedPaidTiers: [...criticalUsageLimitTiers],
      guidance: getUsageLimitsRolloutGuidance(),
    })
  }

  getUsageLimitsRollout() {
    const nodeEnv = this.configService.get('NODE_ENV', { infer: true })
    const rollout = evaluateUsageLimitsRollout({
      nodeEnv,
      usesInMemoryRepository: nodeEnv === 'test',
      supportsDailyCostQuotaEnforcement: true,
      supportsDailyTokenLimitTracking: true,
      supportedPaidTiers: [...criticalUsageLimitTiers],
    })

    return usageLimitsRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceQuotaAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageQuota(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const usage = await this.usageService.getWorkspaceUsageSummary(workspaceId)
    const metrics = await this.usageService.getDailyUsageMetrics(workspaceId)
    const records = (await this.usageService.listRecentUsageEvents(workspaceId))
      .map(toQuotaAdminRecord)
    const stats = buildQuotaAdminStats({
      usage,
      dailyEventCount: metrics.dailyEventCount,
      distinctRunCount: metrics.distinctRunCount,
    })

    return quotaAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      usage,
      records,
      stats,
      availableActions: resolveQuotaAdminActions(),
      guidance: getQuotaAdminGuidance({ stats }),
    })
  }

  async executeQuotaAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_quota_summary'
    },
  ) {
    this.assertCanManageQuota(authContext)

    const payload = quotaAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_quota_summary': {
        const summary = await this.getWorkspaceQuotaAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return quotaAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed quota summary with ${summary.stats.dailyEventCount} usage event(s) and ${summary.stats.costUtilizationPercent}% cost utilization.`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageQuota(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can manage quota tools.',
    })
  }
}
