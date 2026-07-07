import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNonrepudiationizabilityRolloutGuidance,
  nonrepudiationizabilityAdminActionRequestSchema,
  nonrepudiationizabilityAdminActionResponseSchema,
  nonrepudiationizabilityAdminSummaryResponseSchema,
  nonrepudiationizabilityCapabilitiesResponseSchema,
  nonrepudiationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNonrepudiationizabilityAdminRecords,
  buildNonrepudiationizabilityAdminStats,
  getNonrepudiationizabilityAdminGuidance,
  resolveNonrepudiationizabilityAdminActions,
} from './nonrepudiationizability-admin.helpers.js'
import { evaluateNonrepudiationizabilityRollout } from './nonrepudiationizability-rollout.helpers.js'
import { NonrepudiationizabilityStatusService } from './nonrepudiationizability-status.service.js'

@Injectable()
export class NonrepudiationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly nonrepudiationizabilityStatusService: NonrepudiationizabilityStatusService,
  ) {}

  getCapabilities() {
    return nonrepudiationizabilityCapabilitiesResponseSchema.parse({
      supportsNonrepudiationizabilityRollout: true,
      supportsNonrepudiationizabilityAdminTools: true,
      supportsMembershipNonrepudiationizabilitySignals: true,
      supportsUsageEventNonrepudiationizabilitySignals: true,
      guidance: getNonrepudiationizabilityRolloutGuidance(),
    })
  }

  async getNonrepudiationizabilityRollout() {
    const nonrepudiationizabilityTableCoverage =
      await this.nonrepudiationizabilityStatusService.getNonrepudiationizabilityTableCoverage()

    const rollout = evaluateNonrepudiationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.nonrepudiationizabilityStatusService.pingPostgres(),
      existingNonrepudiationizabilityTableCount: nonrepudiationizabilityTableCoverage.existingNonrepudiationizabilityTableCount,
      workspaceMembershipsTableExists: nonrepudiationizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: nonrepudiationizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: nonrepudiationizabilityTableCoverage.billingNotificationsTableExists,
    })

    return nonrepudiationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNonrepudiationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNonrepudiationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.nonrepudiationizabilityStatusService.getWorkspaceNonrepudiationizabilityInventory(
        workspaceId,
      )
    const records = buildNonrepudiationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.nonrepudiationizabilityStatusService.pingPostgres()
    const stats = buildNonrepudiationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return nonrepudiationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNonrepudiationizabilityAdminActions(),
      guidance: getNonrepudiationizabilityAdminGuidance({ stats }),
    })
  }

  async executeNonrepudiationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_nonrepudiationizability_summary'
    },
  ) {
    this.assertCanManageNonrepudiationizability(authContext)

    const payload = nonrepudiationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_nonrepudiationizability_summary': {
        const summary = await this.getWorkspaceNonrepudiationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return nonrepudiationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed nonrepudiationizability summary with ${summary.stats.nonrepudiationizabilityPercent}% membership nonrepudiationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNonrepudiationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production nonrepudiationizability tools.',
    })
  }
}
