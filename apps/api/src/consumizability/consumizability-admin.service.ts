import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConsumizabilityRolloutGuidance,
  consumizabilityAdminActionRequestSchema,
  consumizabilityAdminActionResponseSchema,
  consumizabilityAdminSummaryResponseSchema,
  consumizabilityCapabilitiesResponseSchema,
  consumizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConsumizabilityAdminRecords,
  buildConsumizabilityAdminStats,
  getConsumizabilityAdminGuidance,
  resolveConsumizabilityAdminActions,
} from './consumizability-admin.helpers.js'
import { evaluateConsumizabilityRollout } from './consumizability-rollout.helpers.js'
import { ConsumizabilityStatusService } from './consumizability-status.service.js'

@Injectable()
export class ConsumizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly consumizabilityStatusService: ConsumizabilityStatusService,
  ) {}

  getCapabilities() {
    return consumizabilityCapabilitiesResponseSchema.parse({
      supportsConsumizabilityRollout: true,
      supportsConsumizabilityAdminTools: true,
      supportsWorkspaceLimitConsumizabilitySignals: true,
      supportsUsageEventConsumizabilitySignals: true,
      guidance: getConsumizabilityRolloutGuidance(),
    })
  }

  async getConsumizabilityRollout() {
    const consumizabilityTableCoverage =
      await this.consumizabilityStatusService.getConsumizabilityTableCoverage()

    const rollout = evaluateConsumizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.consumizabilityStatusService.pingPostgres(),
      existingConsumizabilityTableCount: consumizabilityTableCoverage.existingConsumizabilityTableCount,
      workspaceUsageLimitsTableExists: consumizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: consumizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: consumizabilityTableCoverage.billingRecordsTableExists,
    })

    return consumizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConsumizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConsumizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.consumizabilityStatusService.getWorkspaceConsumizabilityInventory(
        workspaceId,
      )
    const records = buildConsumizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.consumizabilityStatusService.pingPostgres()
    const stats = buildConsumizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return consumizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConsumizabilityAdminActions(),
      guidance: getConsumizabilityAdminGuidance({ stats }),
    })
  }

  async executeConsumizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_consumizability_summary'
    },
  ) {
    this.assertCanManageConsumizability(authContext)

    const payload = consumizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_consumizability_summary': {
        const summary = await this.getWorkspaceConsumizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return consumizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed consumizability summary with ${summary.stats.consumizabilityPercent}% workspace limit consumizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConsumizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production consumizability tools.',
    })
  }
}
