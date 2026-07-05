import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConfirmabilityRolloutGuidance,
  confirmabilityAdminActionRequestSchema,
  confirmabilityAdminActionResponseSchema,
  confirmabilityAdminSummaryResponseSchema,
  confirmabilityCapabilitiesResponseSchema,
  confirmabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConfirmabilityAdminRecords,
  buildConfirmabilityAdminStats,
  getConfirmabilityAdminGuidance,
  resolveConfirmabilityAdminActions,
} from './confirmability-admin.helpers.js'
import { evaluateConfirmabilityRollout } from './confirmability-rollout.helpers.js'
import { ConfirmabilityStatusService } from './confirmability-status.service.js'

@Injectable()
export class ConfirmabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly confirmabilityStatusService: ConfirmabilityStatusService,
  ) {}

  getCapabilities() {
    return confirmabilityCapabilitiesResponseSchema.parse({
      supportsConfirmabilityRollout: true,
      supportsConfirmabilityAdminTools: true,
      supportsBillingNotificationConfirmabilitySignals: true,
      supportsUsageLimitConfirmabilitySignals: true,
      guidance: getConfirmabilityRolloutGuidance(),
    })
  }

  async getConfirmabilityRollout() {
    const confirmabilityTableCoverage =
      await this.confirmabilityStatusService.getConfirmabilityTableCoverage()

    const rollout = evaluateConfirmabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.confirmabilityStatusService.pingPostgres(),
      existingConfirmabilityTableCount: confirmabilityTableCoverage.existingConfirmabilityTableCount,
      billingNotificationsTableExists: confirmabilityTableCoverage.billingNotificationsTableExists,
      workspaceUsageLimitsTableExists: confirmabilityTableCoverage.workspaceUsageLimitsTableExists,
      billingMeterUsageReportsTableExists: confirmabilityTableCoverage.billingMeterUsageReportsTableExists,
    })

    return confirmabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConfirmabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConfirmability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.confirmabilityStatusService.getWorkspaceConfirmabilityInventory(
        workspaceId,
      )
    const records = buildConfirmabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.confirmabilityStatusService.pingPostgres()
    const stats = buildConfirmabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return confirmabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConfirmabilityAdminActions(),
      guidance: getConfirmabilityAdminGuidance({ stats }),
    })
  }

  async executeConfirmabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_confirmability_summary'
    },
  ) {
    this.assertCanManageConfirmability(authContext)

    const payload = confirmabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_confirmability_summary': {
        const summary = await this.getWorkspaceConfirmabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return confirmabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed confirmability summary with ${summary.stats.confirmabilityPercent}% billing notification confirmability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConfirmability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production confirmability tools.',
    })
  }
}
