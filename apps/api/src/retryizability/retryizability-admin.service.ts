import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRetryizabilityRolloutGuidance,
  retryizabilityAdminActionRequestSchema,
  retryizabilityAdminActionResponseSchema,
  retryizabilityAdminSummaryResponseSchema,
  retryizabilityCapabilitiesResponseSchema,
  retryizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRetryizabilityAdminRecords,
  buildRetryizabilityAdminStats,
  getRetryizabilityAdminGuidance,
  resolveRetryizabilityAdminActions,
} from './retryizability-admin.helpers.js'
import { evaluateRetryizabilityRollout } from './retryizability-rollout.helpers.js'
import { RetryizabilityStatusService } from './retryizability-status.service.js'

@Injectable()
export class RetryizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly retryizabilityStatusService: RetryizabilityStatusService,
  ) {}

  getCapabilities() {
    return retryizabilityCapabilitiesResponseSchema.parse({
      supportsRetryizabilityRollout: true,
      supportsRetryizabilityAdminTools: true,
      supportsMembershipRetryizabilitySignals: true,
      supportsUsageEventRetryizabilitySignals: true,
      guidance: getRetryizabilityRolloutGuidance(),
    })
  }

  async getRetryizabilityRollout() {
    const retryizabilityTableCoverage =
      await this.retryizabilityStatusService.getRetryizabilityTableCoverage()

    const rollout = evaluateRetryizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.retryizabilityStatusService.pingPostgres(),
      existingRetryizabilityTableCount: retryizabilityTableCoverage.existingRetryizabilityTableCount,
      workspaceMembershipsTableExists: retryizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: retryizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: retryizabilityTableCoverage.billingNotificationsTableExists,
    })

    return retryizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRetryizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRetryizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.retryizabilityStatusService.getWorkspaceRetryizabilityInventory(
        workspaceId,
      )
    const records = buildRetryizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.retryizabilityStatusService.pingPostgres()
    const stats = buildRetryizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return retryizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRetryizabilityAdminActions(),
      guidance: getRetryizabilityAdminGuidance({ stats }),
    })
  }

  async executeRetryizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_retryizability_summary'
    },
  ) {
    this.assertCanManageRetryizability(authContext)

    const payload = retryizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_retryizability_summary': {
        const summary = await this.getWorkspaceRetryizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return retryizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed retryizability summary with ${summary.stats.retryizabilityPercent}% membership retryizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRetryizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production retryizability tools.',
    })
  }
}
