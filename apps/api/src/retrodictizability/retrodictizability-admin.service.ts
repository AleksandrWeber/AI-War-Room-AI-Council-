import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRetrodictizabilityRolloutGuidance,
  retrodictizabilityAdminActionRequestSchema,
  retrodictizabilityAdminActionResponseSchema,
  retrodictizabilityAdminSummaryResponseSchema,
  retrodictizabilityCapabilitiesResponseSchema,
  retrodictizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRetrodictizabilityAdminRecords,
  buildRetrodictizabilityAdminStats,
  getRetrodictizabilityAdminGuidance,
  resolveRetrodictizabilityAdminActions,
} from './retrodictizability-admin.helpers.js'
import { evaluateRetrodictizabilityRollout } from './retrodictizability-rollout.helpers.js'
import { RetrodictizabilityStatusService } from './retrodictizability-status.service.js'

@Injectable()
export class RetrodictizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly retrodictizabilityStatusService: RetrodictizabilityStatusService,
  ) {}

  getCapabilities() {
    return retrodictizabilityCapabilitiesResponseSchema.parse({
      supportsRetrodictizabilityRollout: true,
      supportsRetrodictizabilityAdminTools: true,
      supportsMembershipRetrodictizabilitySignals: true,
      supportsUsageEventRetrodictizabilitySignals: true,
      guidance: getRetrodictizabilityRolloutGuidance(),
    })
  }

  async getRetrodictizabilityRollout() {
    const retrodictizabilityTableCoverage =
      await this.retrodictizabilityStatusService.getRetrodictizabilityTableCoverage()

    const rollout = evaluateRetrodictizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.retrodictizabilityStatusService.pingPostgres(),
      existingRetrodictizabilityTableCount: retrodictizabilityTableCoverage.existingRetrodictizabilityTableCount,
      workspaceMembershipsTableExists: retrodictizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: retrodictizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: retrodictizabilityTableCoverage.billingNotificationsTableExists,
    })

    return retrodictizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRetrodictizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRetrodictizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.retrodictizabilityStatusService.getWorkspaceRetrodictizabilityInventory(
        workspaceId,
      )
    const records = buildRetrodictizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.retrodictizabilityStatusService.pingPostgres()
    const stats = buildRetrodictizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return retrodictizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRetrodictizabilityAdminActions(),
      guidance: getRetrodictizabilityAdminGuidance({ stats }),
    })
  }

  async executeRetrodictizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_retrodictizability_summary'
    },
  ) {
    this.assertCanManageRetrodictizability(authContext)

    const payload = retrodictizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_retrodictizability_summary': {
        const summary = await this.getWorkspaceRetrodictizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return retrodictizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed retrodictizability summary with ${summary.stats.retrodictizabilityPercent}% membership retrodictizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRetrodictizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production retrodictizability tools.',
    })
  }
}
