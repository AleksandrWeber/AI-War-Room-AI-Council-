import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTypologizabilityRolloutGuidance,
  typologizabilityAdminActionRequestSchema,
  typologizabilityAdminActionResponseSchema,
  typologizabilityAdminSummaryResponseSchema,
  typologizabilityCapabilitiesResponseSchema,
  typologizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTypologizabilityAdminRecords,
  buildTypologizabilityAdminStats,
  getTypologizabilityAdminGuidance,
  resolveTypologizabilityAdminActions,
} from './typologizability-admin.helpers.js'
import { evaluateTypologizabilityRollout } from './typologizability-rollout.helpers.js'
import { TypologizabilityStatusService } from './typologizability-status.service.js'

@Injectable()
export class TypologizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly typologizabilityStatusService: TypologizabilityStatusService,
  ) {}

  getCapabilities() {
    return typologizabilityCapabilitiesResponseSchema.parse({
      supportsTypologizabilityRollout: true,
      supportsTypologizabilityAdminTools: true,
      supportsMembershipTypologizabilitySignals: true,
      supportsUsageEventTypologizabilitySignals: true,
      guidance: getTypologizabilityRolloutGuidance(),
    })
  }

  async getTypologizabilityRollout() {
    const typologizabilityTableCoverage =
      await this.typologizabilityStatusService.getTypologizabilityTableCoverage()

    const rollout = evaluateTypologizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.typologizabilityStatusService.pingPostgres(),
      existingTypologizabilityTableCount: typologizabilityTableCoverage.existingTypologizabilityTableCount,
      workspaceMembershipsTableExists: typologizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: typologizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: typologizabilityTableCoverage.billingNotificationsTableExists,
    })

    return typologizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTypologizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTypologizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.typologizabilityStatusService.getWorkspaceTypologizabilityInventory(
        workspaceId,
      )
    const records = buildTypologizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.typologizabilityStatusService.pingPostgres()
    const stats = buildTypologizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return typologizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTypologizabilityAdminActions(),
      guidance: getTypologizabilityAdminGuidance({ stats }),
    })
  }

  async executeTypologizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_typologizability_summary'
    },
  ) {
    this.assertCanManageTypologizability(authContext)

    const payload = typologizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_typologizability_summary': {
        const summary = await this.getWorkspaceTypologizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return typologizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed typologizability summary with ${summary.stats.typologizabilityPercent}% membership typologizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTypologizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production typologizability tools.',
    })
  }
}
