import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPerceptibilityRolloutGuidance,
  perceptibilityAdminActionRequestSchema,
  perceptibilityAdminActionResponseSchema,
  perceptibilityAdminSummaryResponseSchema,
  perceptibilityCapabilitiesResponseSchema,
  perceptibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPerceptibilityAdminRecords,
  buildPerceptibilityAdminStats,
  getPerceptibilityAdminGuidance,
  resolvePerceptibilityAdminActions,
} from './perceptibility-admin.helpers.js'
import { evaluatePerceptibilityRollout } from './perceptibility-rollout.helpers.js'
import { PerceptibilityStatusService } from './perceptibility-status.service.js'

@Injectable()
export class PerceptibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly perceptibilityStatusService: PerceptibilityStatusService,
  ) {}

  getCapabilities() {
    return perceptibilityCapabilitiesResponseSchema.parse({
      supportsPerceptibilityRollout: true,
      supportsPerceptibilityAdminTools: true,
      supportsUsageEventPerceptibilitySignals: true,
      supportsMeterUsagePerceptibilitySignals: true,
      guidance: getPerceptibilityRolloutGuidance(),
    })
  }

  async getPerceptibilityRollout() {
    const perceptibilityTableCoverage =
      await this.perceptibilityStatusService.getPerceptibilityTableCoverage()

    const rollout = evaluatePerceptibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.perceptibilityStatusService.pingPostgres(),
      existingPerceptibilityTableCount: perceptibilityTableCoverage.existingPerceptibilityTableCount,
      usageEventsTableExists: perceptibilityTableCoverage.usageEventsTableExists,
      billingMeterUsageReportsTableExists: perceptibilityTableCoverage.billingMeterUsageReportsTableExists,
      workspaceUsageLimitsTableExists: perceptibilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return perceptibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePerceptibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePerceptibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.perceptibilityStatusService.getWorkspacePerceptibilityInventory(
        workspaceId,
      )
    const records = buildPerceptibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.perceptibilityStatusService.pingPostgres()
    const stats = buildPerceptibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return perceptibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePerceptibilityAdminActions(),
      guidance: getPerceptibilityAdminGuidance({ stats }),
    })
  }

  async executePerceptibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_perceptibility_summary'
    },
  ) {
    this.assertCanManagePerceptibility(authContext)

    const payload = perceptibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_perceptibility_summary': {
        const summary = await this.getWorkspacePerceptibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return perceptibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed perceptibility summary with ${summary.stats.perceptibilityPercent}% usage event perceptibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePerceptibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production perceptibility tools.',
    })
  }
}
