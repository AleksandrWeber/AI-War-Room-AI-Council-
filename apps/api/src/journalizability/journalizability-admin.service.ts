import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getJournalizabilityRolloutGuidance,
  journalizabilityAdminActionRequestSchema,
  journalizabilityAdminActionResponseSchema,
  journalizabilityAdminSummaryResponseSchema,
  journalizabilityCapabilitiesResponseSchema,
  journalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildJournalizabilityAdminRecords,
  buildJournalizabilityAdminStats,
  getJournalizabilityAdminGuidance,
  resolveJournalizabilityAdminActions,
} from './journalizability-admin.helpers.js'
import { evaluateJournalizabilityRollout } from './journalizability-rollout.helpers.js'
import { JournalizabilityStatusService } from './journalizability-status.service.js'

@Injectable()
export class JournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly journalizabilityStatusService: JournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return journalizabilityCapabilitiesResponseSchema.parse({
      supportsJournalizabilityRollout: true,
      supportsJournalizabilityAdminTools: true,
      supportsMembershipJournalizabilitySignals: true,
      supportsUsageEventJournalizabilitySignals: true,
      guidance: getJournalizabilityRolloutGuidance(),
    })
  }

  async getJournalizabilityRollout() {
    const journalizabilityTableCoverage =
      await this.journalizabilityStatusService.getJournalizabilityTableCoverage()

    const rollout = evaluateJournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.journalizabilityStatusService.pingPostgres(),
      existingJournalizabilityTableCount: journalizabilityTableCoverage.existingJournalizabilityTableCount,
      workspaceMembershipsTableExists: journalizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: journalizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: journalizabilityTableCoverage.billingNotificationsTableExists,
    })

    return journalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceJournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageJournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.journalizabilityStatusService.getWorkspaceJournalizabilityInventory(
        workspaceId,
      )
    const records = buildJournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.journalizabilityStatusService.pingPostgres()
    const stats = buildJournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return journalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveJournalizabilityAdminActions(),
      guidance: getJournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeJournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_journalizability_summary'
    },
  ) {
    this.assertCanManageJournalizability(authContext)

    const payload = journalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_journalizability_summary': {
        const summary = await this.getWorkspaceJournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return journalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed journalizability summary with ${summary.stats.journalizabilityPercent}% membership journalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageJournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production journalizability tools.',
    })
  }
}
