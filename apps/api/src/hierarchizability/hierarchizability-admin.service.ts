import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHierarchizabilityRolloutGuidance,
  hierarchizabilityAdminActionRequestSchema,
  hierarchizabilityAdminActionResponseSchema,
  hierarchizabilityAdminSummaryResponseSchema,
  hierarchizabilityCapabilitiesResponseSchema,
  hierarchizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHierarchizabilityAdminRecords,
  buildHierarchizabilityAdminStats,
  getHierarchizabilityAdminGuidance,
  resolveHierarchizabilityAdminActions,
} from './hierarchizability-admin.helpers.js'
import { evaluateHierarchizabilityRollout } from './hierarchizability-rollout.helpers.js'
import { HierarchizabilityStatusService } from './hierarchizability-status.service.js'

@Injectable()
export class HierarchizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly hierarchizabilityStatusService: HierarchizabilityStatusService,
  ) {}

  getCapabilities() {
    return hierarchizabilityCapabilitiesResponseSchema.parse({
      supportsHierarchizabilityRollout: true,
      supportsHierarchizabilityAdminTools: true,
      supportsMeterUsageHierarchizabilitySignals: true,
      supportsUsageEventHierarchizabilitySignals: true,
      guidance: getHierarchizabilityRolloutGuidance(),
    })
  }

  async getHierarchizabilityRollout() {
    const hierarchizabilityTableCoverage =
      await this.hierarchizabilityStatusService.getHierarchizabilityTableCoverage()

    const rollout = evaluateHierarchizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.hierarchizabilityStatusService.pingPostgres(),
      existingHierarchizabilityTableCount: hierarchizabilityTableCoverage.existingHierarchizabilityTableCount,
      billingMeterUsageReportsTableExists: hierarchizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: hierarchizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: hierarchizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return hierarchizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHierarchizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHierarchizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.hierarchizabilityStatusService.getWorkspaceHierarchizabilityInventory(
        workspaceId,
      )
    const records = buildHierarchizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.hierarchizabilityStatusService.pingPostgres()
    const stats = buildHierarchizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return hierarchizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHierarchizabilityAdminActions(),
      guidance: getHierarchizabilityAdminGuidance({ stats }),
    })
  }

  async executeHierarchizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_hierarchizability_summary'
    },
  ) {
    this.assertCanManageHierarchizability(authContext)

    const payload = hierarchizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_hierarchizability_summary': {
        const summary = await this.getWorkspaceHierarchizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return hierarchizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed hierarchizability summary with ${summary.stats.hierarchizabilityPercent}% meter usage hierarchizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHierarchizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production hierarchizability tools.',
    })
  }
}
