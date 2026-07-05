import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMaintainabilizabilityRolloutGuidance,
  maintainabilizabilityAdminActionRequestSchema,
  maintainabilizabilityAdminActionResponseSchema,
  maintainabilizabilityAdminSummaryResponseSchema,
  maintainabilizabilityCapabilitiesResponseSchema,
  maintainabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMaintainabilizabilityAdminRecords,
  buildMaintainabilizabilityAdminStats,
  getMaintainabilizabilityAdminGuidance,
  resolveMaintainabilizabilityAdminActions,
} from './maintainabilizability-admin.helpers.js'
import { evaluateMaintainabilizabilityRollout } from './maintainabilizability-rollout.helpers.js'
import { MaintainabilizabilityStatusService } from './maintainabilizability-status.service.js'

@Injectable()
export class MaintainabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly maintainabilizabilityStatusService: MaintainabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return maintainabilizabilityCapabilitiesResponseSchema.parse({
      supportsMaintainabilizabilityRollout: true,
      supportsMaintainabilizabilityAdminTools: true,
      supportsMembershipMaintainabilizabilitySignals: true,
      supportsUsageEventMaintainabilizabilitySignals: true,
      guidance: getMaintainabilizabilityRolloutGuidance(),
    })
  }

  async getMaintainabilizabilityRollout() {
    const maintainabilizabilityTableCoverage =
      await this.maintainabilizabilityStatusService.getMaintainabilizabilityTableCoverage()

    const rollout = evaluateMaintainabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.maintainabilizabilityStatusService.pingPostgres(),
      existingMaintainabilizabilityTableCount: maintainabilizabilityTableCoverage.existingMaintainabilizabilityTableCount,
      workspaceMembershipsTableExists: maintainabilizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: maintainabilizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: maintainabilizabilityTableCoverage.billingNotificationsTableExists,
    })

    return maintainabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMaintainabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMaintainabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.maintainabilizabilityStatusService.getWorkspaceMaintainabilizabilityInventory(
        workspaceId,
      )
    const records = buildMaintainabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.maintainabilizabilityStatusService.pingPostgres()
    const stats = buildMaintainabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return maintainabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMaintainabilizabilityAdminActions(),
      guidance: getMaintainabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeMaintainabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_maintainabilizability_summary'
    },
  ) {
    this.assertCanManageMaintainabilizability(authContext)

    const payload = maintainabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_maintainabilizability_summary': {
        const summary = await this.getWorkspaceMaintainabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return maintainabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed maintainabilizability summary with ${summary.stats.maintainabilizabilityPercent}% membership maintainabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMaintainabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production maintainabilizability tools.',
    })
  }
}
