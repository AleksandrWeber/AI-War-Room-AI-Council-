import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOrchestrizabilityRolloutGuidance,
  orchestrizabilityAdminActionRequestSchema,
  orchestrizabilityAdminActionResponseSchema,
  orchestrizabilityAdminSummaryResponseSchema,
  orchestrizabilityCapabilitiesResponseSchema,
  orchestrizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOrchestrizabilityAdminRecords,
  buildOrchestrizabilityAdminStats,
  getOrchestrizabilityAdminGuidance,
  resolveOrchestrizabilityAdminActions,
} from './orchestrizability-admin.helpers.js'
import { evaluateOrchestrizabilityRollout } from './orchestrizability-rollout.helpers.js'
import { OrchestrizabilityStatusService } from './orchestrizability-status.service.js'

@Injectable()
export class OrchestrizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly orchestrizabilityStatusService: OrchestrizabilityStatusService,
  ) {}

  getCapabilities() {
    return orchestrizabilityCapabilitiesResponseSchema.parse({
      supportsOrchestrizabilityRollout: true,
      supportsOrchestrizabilityAdminTools: true,
      supportsMembershipOrchestrizabilitySignals: true,
      supportsUsageEventOrchestrizabilitySignals: true,
      guidance: getOrchestrizabilityRolloutGuidance(),
    })
  }

  async getOrchestrizabilityRollout() {
    const orchestrizabilityTableCoverage =
      await this.orchestrizabilityStatusService.getOrchestrizabilityTableCoverage()

    const rollout = evaluateOrchestrizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.orchestrizabilityStatusService.pingPostgres(),
      existingOrchestrizabilityTableCount: orchestrizabilityTableCoverage.existingOrchestrizabilityTableCount,
      workspaceMembershipsTableExists: orchestrizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: orchestrizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: orchestrizabilityTableCoverage.billingNotificationsTableExists,
    })

    return orchestrizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOrchestrizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOrchestrizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.orchestrizabilityStatusService.getWorkspaceOrchestrizabilityInventory(
        workspaceId,
      )
    const records = buildOrchestrizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.orchestrizabilityStatusService.pingPostgres()
    const stats = buildOrchestrizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return orchestrizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOrchestrizabilityAdminActions(),
      guidance: getOrchestrizabilityAdminGuidance({ stats }),
    })
  }

  async executeOrchestrizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_orchestrizability_summary'
    },
  ) {
    this.assertCanManageOrchestrizability(authContext)

    const payload = orchestrizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_orchestrizability_summary': {
        const summary = await this.getWorkspaceOrchestrizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return orchestrizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed orchestrizability summary with ${summary.stats.orchestrizabilityPercent}% membership orchestrizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOrchestrizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production orchestrizability tools.',
    })
  }
}
