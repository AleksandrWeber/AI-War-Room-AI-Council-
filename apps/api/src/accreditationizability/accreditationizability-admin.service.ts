import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAccreditationizabilityRolloutGuidance,
  accreditationizabilityAdminActionRequestSchema,
  accreditationizabilityAdminActionResponseSchema,
  accreditationizabilityAdminSummaryResponseSchema,
  accreditationizabilityCapabilitiesResponseSchema,
  accreditationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAccreditationizabilityAdminRecords,
  buildAccreditationizabilityAdminStats,
  getAccreditationizabilityAdminGuidance,
  resolveAccreditationizabilityAdminActions,
} from './accreditationizability-admin.helpers.js'
import { evaluateAccreditationizabilityRollout } from './accreditationizability-rollout.helpers.js'
import { AccreditationizabilityStatusService } from './accreditationizability-status.service.js'

@Injectable()
export class AccreditationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly accreditationizabilityStatusService: AccreditationizabilityStatusService,
  ) {}

  getCapabilities() {
    return accreditationizabilityCapabilitiesResponseSchema.parse({
      supportsAccreditationizabilityRollout: true,
      supportsAccreditationizabilityAdminTools: true,
      supportsMembershipAccreditationizabilitySignals: true,
      supportsUsageEventAccreditationizabilitySignals: true,
      guidance: getAccreditationizabilityRolloutGuidance(),
    })
  }

  async getAccreditationizabilityRollout() {
    const accreditationizabilityTableCoverage =
      await this.accreditationizabilityStatusService.getAccreditationizabilityTableCoverage()

    const rollout = evaluateAccreditationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.accreditationizabilityStatusService.pingPostgres(),
      existingAccreditationizabilityTableCount: accreditationizabilityTableCoverage.existingAccreditationizabilityTableCount,
      workspaceMembershipsTableExists: accreditationizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: accreditationizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: accreditationizabilityTableCoverage.billingNotificationsTableExists,
    })

    return accreditationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAccreditationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAccreditationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.accreditationizabilityStatusService.getWorkspaceAccreditationizabilityInventory(
        workspaceId,
      )
    const records = buildAccreditationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.accreditationizabilityStatusService.pingPostgres()
    const stats = buildAccreditationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return accreditationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAccreditationizabilityAdminActions(),
      guidance: getAccreditationizabilityAdminGuidance({ stats }),
    })
  }

  async executeAccreditationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_accreditationizability_summary'
    },
  ) {
    this.assertCanManageAccreditationizability(authContext)

    const payload = accreditationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_accreditationizability_summary': {
        const summary = await this.getWorkspaceAccreditationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return accreditationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed accreditationizability summary with ${summary.stats.accreditationizabilityPercent}% membership accreditationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAccreditationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production accreditationizability tools.',
    })
  }
}
