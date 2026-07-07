import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHealingizabilityRolloutGuidance,
  healingizabilityAdminActionRequestSchema,
  healingizabilityAdminActionResponseSchema,
  healingizabilityAdminSummaryResponseSchema,
  healingizabilityCapabilitiesResponseSchema,
  healingizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHealingizabilityAdminRecords,
  buildHealingizabilityAdminStats,
  getHealingizabilityAdminGuidance,
  resolveHealingizabilityAdminActions,
} from './healingizability-admin.helpers.js'
import { evaluateHealingizabilityRollout } from './healingizability-rollout.helpers.js'
import { HealingizabilityStatusService } from './healingizability-status.service.js'

@Injectable()
export class HealingizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly healingizabilityStatusService: HealingizabilityStatusService,
  ) {}

  getCapabilities() {
    return healingizabilityCapabilitiesResponseSchema.parse({
      supportsHealingizabilityRollout: true,
      supportsHealingizabilityAdminTools: true,
      supportsMembershipHealingizabilitySignals: true,
      supportsUsageEventHealingizabilitySignals: true,
      guidance: getHealingizabilityRolloutGuidance(),
    })
  }

  async getHealingizabilityRollout() {
    const healingizabilityTableCoverage =
      await this.healingizabilityStatusService.getHealingizabilityTableCoverage()

    const rollout = evaluateHealingizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.healingizabilityStatusService.pingPostgres(),
      existingHealingizabilityTableCount: healingizabilityTableCoverage.existingHealingizabilityTableCount,
      workspaceMembershipsTableExists: healingizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: healingizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: healingizabilityTableCoverage.billingNotificationsTableExists,
    })

    return healingizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHealingizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHealingizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.healingizabilityStatusService.getWorkspaceHealingizabilityInventory(
        workspaceId,
      )
    const records = buildHealingizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.healingizabilityStatusService.pingPostgres()
    const stats = buildHealingizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return healingizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHealingizabilityAdminActions(),
      guidance: getHealingizabilityAdminGuidance({ stats }),
    })
  }

  async executeHealingizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_healingizability_summary'
    },
  ) {
    this.assertCanManageHealingizability(authContext)

    const payload = healingizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_healingizability_summary': {
        const summary = await this.getWorkspaceHealingizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return healingizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed healingizability summary with ${summary.stats.healingizabilityPercent}% membership healingizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHealingizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production healingizability tools.',
    })
  }
}
