import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDistributizabilityRolloutGuidance,
  distributizabilityAdminActionRequestSchema,
  distributizabilityAdminActionResponseSchema,
  distributizabilityAdminSummaryResponseSchema,
  distributizabilityCapabilitiesResponseSchema,
  distributizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDistributizabilityAdminRecords,
  buildDistributizabilityAdminStats,
  getDistributizabilityAdminGuidance,
  resolveDistributizabilityAdminActions,
} from './distributizability-admin.helpers.js'
import { evaluateDistributizabilityRollout } from './distributizability-rollout.helpers.js'
import { DistributizabilityStatusService } from './distributizability-status.service.js'

@Injectable()
export class DistributizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly distributizabilityStatusService: DistributizabilityStatusService,
  ) {}

  getCapabilities() {
    return distributizabilityCapabilitiesResponseSchema.parse({
      supportsDistributizabilityRollout: true,
      supportsDistributizabilityAdminTools: true,
      supportsMeterUsageDistributizabilitySignals: true,
      supportsUsageEventDistributizabilitySignals: true,
      guidance: getDistributizabilityRolloutGuidance(),
    })
  }

  async getDistributizabilityRollout() {
    const distributizabilityTableCoverage =
      await this.distributizabilityStatusService.getDistributizabilityTableCoverage()

    const rollout = evaluateDistributizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.distributizabilityStatusService.pingPostgres(),
      existingDistributizabilityTableCount: distributizabilityTableCoverage.existingDistributizabilityTableCount,
      billingMeterUsageReportsTableExists: distributizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: distributizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: distributizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return distributizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDistributizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDistributizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.distributizabilityStatusService.getWorkspaceDistributizabilityInventory(
        workspaceId,
      )
    const records = buildDistributizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.distributizabilityStatusService.pingPostgres()
    const stats = buildDistributizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return distributizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDistributizabilityAdminActions(),
      guidance: getDistributizabilityAdminGuidance({ stats }),
    })
  }

  async executeDistributizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_distributizability_summary'
    },
  ) {
    this.assertCanManageDistributizability(authContext)

    const payload = distributizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_distributizability_summary': {
        const summary = await this.getWorkspaceDistributizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return distributizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed distributizability summary with ${summary.stats.distributizabilityPercent}% meter usage distributizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDistributizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production distributizability tools.',
    })
  }
}
