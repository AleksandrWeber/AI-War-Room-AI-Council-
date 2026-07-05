import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getUsabilityRolloutGuidance,
  usabilityAdminActionRequestSchema,
  usabilityAdminActionResponseSchema,
  usabilityAdminSummaryResponseSchema,
  usabilityCapabilitiesResponseSchema,
  usabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildUsabilityAdminRecords,
  buildUsabilityAdminStats,
  getUsabilityAdminGuidance,
  resolveUsabilityAdminActions,
} from './usability-admin.helpers.js'
import { evaluateUsabilityRollout } from './usability-rollout.helpers.js'
import { UsabilityStatusService } from './usability-status.service.js'

@Injectable()
export class UsabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly usabilityStatusService: UsabilityStatusService,
  ) {}

  getCapabilities() {
    return usabilityCapabilitiesResponseSchema.parse({
      supportsUsabilityRollout: true,
      supportsUsabilityAdminTools: true,
      supportsMembershipUsabilitySignals: true,
      supportsUsageEventUsabilitySignals: true,
      guidance: getUsabilityRolloutGuidance(),
    })
  }

  async getUsabilityRollout() {
    const usabilityTableCoverage =
      await this.usabilityStatusService.getUsabilityTableCoverage()

    const rollout = evaluateUsabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.usabilityStatusService.pingPostgres(),
      existingUsabilityTableCount: usabilityTableCoverage.existingUsabilityTableCount,
      workspaceMembershipsTableExists: usabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: usabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: usabilityTableCoverage.billingNotificationsTableExists,
    })

    return usabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceUsabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageUsability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.usabilityStatusService.getWorkspaceUsabilityInventory(
        workspaceId,
      )
    const records = buildUsabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.usabilityStatusService.pingPostgres()
    const stats = buildUsabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return usabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveUsabilityAdminActions(),
      guidance: getUsabilityAdminGuidance({ stats }),
    })
  }

  async executeUsabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_usability_summary'
    },
  ) {
    this.assertCanManageUsability(authContext)

    const payload = usabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_usability_summary': {
        const summary = await this.getWorkspaceUsabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return usabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed usability summary with ${summary.stats.usabilityPercent}% membership usability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageUsability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production usability tools.',
    })
  }
}
