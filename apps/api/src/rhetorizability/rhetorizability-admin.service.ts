import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRhetorizabilityRolloutGuidance,
  rhetorizabilityAdminActionRequestSchema,
  rhetorizabilityAdminActionResponseSchema,
  rhetorizabilityAdminSummaryResponseSchema,
  rhetorizabilityCapabilitiesResponseSchema,
  rhetorizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRhetorizabilityAdminRecords,
  buildRhetorizabilityAdminStats,
  getRhetorizabilityAdminGuidance,
  resolveRhetorizabilityAdminActions,
} from './rhetorizability-admin.helpers.js'
import { evaluateRhetorizabilityRollout } from './rhetorizability-rollout.helpers.js'
import { RhetorizabilityStatusService } from './rhetorizability-status.service.js'

@Injectable()
export class RhetorizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly rhetorizabilityStatusService: RhetorizabilityStatusService,
  ) {}

  getCapabilities() {
    return rhetorizabilityCapabilitiesResponseSchema.parse({
      supportsRhetorizabilityRollout: true,
      supportsRhetorizabilityAdminTools: true,
      supportsMeterUsageRhetorizabilitySignals: true,
      supportsUsageEventRhetorizabilitySignals: true,
      guidance: getRhetorizabilityRolloutGuidance(),
    })
  }

  async getRhetorizabilityRollout() {
    const rhetorizabilityTableCoverage =
      await this.rhetorizabilityStatusService.getRhetorizabilityTableCoverage()

    const rollout = evaluateRhetorizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.rhetorizabilityStatusService.pingPostgres(),
      existingRhetorizabilityTableCount: rhetorizabilityTableCoverage.existingRhetorizabilityTableCount,
      billingMeterUsageReportsTableExists: rhetorizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: rhetorizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: rhetorizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return rhetorizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRhetorizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRhetorizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.rhetorizabilityStatusService.getWorkspaceRhetorizabilityInventory(
        workspaceId,
      )
    const records = buildRhetorizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.rhetorizabilityStatusService.pingPostgres()
    const stats = buildRhetorizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return rhetorizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRhetorizabilityAdminActions(),
      guidance: getRhetorizabilityAdminGuidance({ stats }),
    })
  }

  async executeRhetorizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_rhetorizability_summary'
    },
  ) {
    this.assertCanManageRhetorizability(authContext)

    const payload = rhetorizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_rhetorizability_summary': {
        const summary = await this.getWorkspaceRhetorizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return rhetorizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed rhetorizability summary with ${summary.stats.rhetorizabilityPercent}% meter usage rhetorizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRhetorizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production rhetorizability tools.',
    })
  }
}
