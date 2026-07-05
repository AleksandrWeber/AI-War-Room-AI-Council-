import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFlexibilityRolloutGuidance,
  flexibilityAdminActionRequestSchema,
  flexibilityAdminActionResponseSchema,
  flexibilityAdminSummaryResponseSchema,
  flexibilityCapabilitiesResponseSchema,
  flexibilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFlexibilityAdminRecords,
  buildFlexibilityAdminStats,
  getFlexibilityAdminGuidance,
  resolveFlexibilityAdminActions,
} from './flexibility-admin.helpers.js'
import { evaluateFlexibilityRollout } from './flexibility-rollout.helpers.js'
import { FlexibilityStatusService } from './flexibility-status.service.js'

@Injectable()
export class FlexibilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly flexibilityStatusService: FlexibilityStatusService,
  ) {}

  getCapabilities() {
    return flexibilityCapabilitiesResponseSchema.parse({
      supportsFlexibilityRollout: true,
      supportsFlexibilityAdminTools: true,
      supportsWorkflowFlexibilitySignals: true,
      supportsUsageEventFlexibilitySignals: true,
      guidance: getFlexibilityRolloutGuidance(),
    })
  }

  async getFlexibilityRollout() {
    const flexibilityTableCoverage =
      await this.flexibilityStatusService.getFlexibilityTableCoverage()

    const rollout = evaluateFlexibilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.flexibilityStatusService.pingPostgres(),
      existingFlexibilityTableCount: flexibilityTableCoverage.existingFlexibilityTableCount,
      runWorkflowsTableExists: flexibilityTableCoverage.runWorkflowsTableExists,
      usageEventsTableExists: flexibilityTableCoverage.usageEventsTableExists,
      shieldScansTableExists: flexibilityTableCoverage.shieldScansTableExists,
    })

    return flexibilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFlexibilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFlexibility(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.flexibilityStatusService.getWorkspaceFlexibilityInventory(
        workspaceId,
      )
    const records = buildFlexibilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.flexibilityStatusService.pingPostgres()
    const stats = buildFlexibilityAdminStats({
      records,
      postgresConnectivity,
    })

    return flexibilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFlexibilityAdminActions(),
      guidance: getFlexibilityAdminGuidance({ stats }),
    })
  }

  async executeFlexibilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_flexibility_summary'
    },
  ) {
    this.assertCanManageFlexibility(authContext)

    const payload = flexibilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_flexibility_summary': {
        const summary = await this.getWorkspaceFlexibilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return flexibilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed flexibility summary with ${summary.stats.flexibilityPercent}% workflow flexibility across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFlexibility(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production flexibility tools.',
    })
  }
}
