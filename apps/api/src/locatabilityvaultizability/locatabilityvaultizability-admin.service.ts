import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLocatabilityvaultizabilityRolloutGuidance,
  locatabilityvaultizabilityAdminActionRequestSchema,
  locatabilityvaultizabilityAdminActionResponseSchema,
  locatabilityvaultizabilityAdminSummaryResponseSchema,
  locatabilityvaultizabilityCapabilitiesResponseSchema,
  locatabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLocatabilityvaultizabilityAdminRecords,
  buildLocatabilityvaultizabilityAdminStats,
  getLocatabilityvaultizabilityAdminGuidance,
  resolveLocatabilityvaultizabilityAdminActions,
} from './locatabilityvaultizability-admin.helpers.js'
import { evaluateLocatabilityvaultizabilityRollout } from './locatabilityvaultizability-rollout.helpers.js'
import { LocatabilityvaultizabilityStatusService } from './locatabilityvaultizability-status.service.js'

@Injectable()
export class LocatabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly locatabilityvaultizabilityStatusService: LocatabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return locatabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsLocatabilityvaultizabilityRollout: true,
      supportsLocatabilityvaultizabilityAdminTools: true,
      supportsMembershipLocatabilityvaultizabilitySignals: true,
      supportsUsageEventLocatabilityvaultizabilitySignals: true,
      guidance: getLocatabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getLocatabilityvaultizabilityRollout() {
    const locatabilityvaultizabilityTableCoverage =
      await this.locatabilityvaultizabilityStatusService.getLocatabilityvaultizabilityTableCoverage()

    const rollout = evaluateLocatabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.locatabilityvaultizabilityStatusService.pingPostgres(),
      existingLocatabilityvaultizabilityTableCount: locatabilityvaultizabilityTableCoverage.existingLocatabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: locatabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: locatabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: locatabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return locatabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLocatabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLocatabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.locatabilityvaultizabilityStatusService.getWorkspaceLocatabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildLocatabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.locatabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildLocatabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return locatabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLocatabilityvaultizabilityAdminActions(),
      guidance: getLocatabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeLocatabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_locatabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageLocatabilityvaultizability(authContext)

    const payload = locatabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_locatabilityvaultizability_summary': {
        const summary = await this.getWorkspaceLocatabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return locatabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed locatabilityvaultizability summary with ${summary.stats.locatabilityvaultizabilityPercent}% membership locatabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLocatabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production locatabilityvaultizability tools.',
    })
  }
}
