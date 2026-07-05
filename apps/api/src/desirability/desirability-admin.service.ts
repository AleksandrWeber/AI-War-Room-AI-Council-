import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDesirabilityRolloutGuidance,
  desirabilityAdminActionRequestSchema,
  desirabilityAdminActionResponseSchema,
  desirabilityAdminSummaryResponseSchema,
  desirabilityCapabilitiesResponseSchema,
  desirabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDesirabilityAdminRecords,
  buildDesirabilityAdminStats,
  getDesirabilityAdminGuidance,
  resolveDesirabilityAdminActions,
} from './desirability-admin.helpers.js'
import { evaluateDesirabilityRollout } from './desirability-rollout.helpers.js'
import { DesirabilityStatusService } from './desirability-status.service.js'

@Injectable()
export class DesirabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly desirabilityStatusService: DesirabilityStatusService,
  ) {}

  getCapabilities() {
    return desirabilityCapabilitiesResponseSchema.parse({
      supportsDesirabilityRollout: true,
      supportsDesirabilityAdminTools: true,
      supportsUsageEventDesirabilitySignals: true,
      supportsBillingNotificationDesirabilitySignals: true,
      guidance: getDesirabilityRolloutGuidance(),
    })
  }

  async getDesirabilityRollout() {
    const desirabilityTableCoverage =
      await this.desirabilityStatusService.getDesirabilityTableCoverage()

    const rollout = evaluateDesirabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.desirabilityStatusService.pingPostgres(),
      existingDesirabilityTableCount: desirabilityTableCoverage.existingDesirabilityTableCount,
      usageEventsTableExists: desirabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: desirabilityTableCoverage.billingNotificationsTableExists,
      workspaceMembershipsTableExists: desirabilityTableCoverage.workspaceMembershipsTableExists,
    })

    return desirabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDesirabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDesirability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.desirabilityStatusService.getWorkspaceDesirabilityInventory(
        workspaceId,
      )
    const records = buildDesirabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.desirabilityStatusService.pingPostgres()
    const stats = buildDesirabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return desirabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDesirabilityAdminActions(),
      guidance: getDesirabilityAdminGuidance({ stats }),
    })
  }

  async executeDesirabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_desirability_summary'
    },
  ) {
    this.assertCanManageDesirability(authContext)

    const payload = desirabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_desirability_summary': {
        const summary = await this.getWorkspaceDesirabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return desirabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed desirability summary with ${summary.stats.desirabilityPercent}% usage event desirability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDesirability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production desirability tools.',
    })
  }
}
