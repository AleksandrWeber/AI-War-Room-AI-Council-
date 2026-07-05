import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getStandardizabilityRolloutGuidance,
  standardizabilityAdminActionRequestSchema,
  standardizabilityAdminActionResponseSchema,
  standardizabilityAdminSummaryResponseSchema,
  standardizabilityCapabilitiesResponseSchema,
  standardizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildStandardizabilityAdminRecords,
  buildStandardizabilityAdminStats,
  getStandardizabilityAdminGuidance,
  resolveStandardizabilityAdminActions,
} from './standardizability-admin.helpers.js'
import { evaluateStandardizabilityRollout } from './standardizability-rollout.helpers.js'
import { StandardizabilityStatusService } from './standardizability-status.service.js'

@Injectable()
export class StandardizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly standardizabilityStatusService: StandardizabilityStatusService,
  ) {}

  getCapabilities() {
    return standardizabilityCapabilitiesResponseSchema.parse({
      supportsStandardizabilityRollout: true,
      supportsStandardizabilityAdminTools: true,
      supportsWorkspaceLimitStandardizabilitySignals: true,
      supportsUsageEventStandardizabilitySignals: true,
      guidance: getStandardizabilityRolloutGuidance(),
    })
  }

  async getStandardizabilityRollout() {
    const standardizabilityTableCoverage =
      await this.standardizabilityStatusService.getStandardizabilityTableCoverage()

    const rollout = evaluateStandardizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.standardizabilityStatusService.pingPostgres(),
      existingStandardizabilityTableCount: standardizabilityTableCoverage.existingStandardizabilityTableCount,
      workspaceUsageLimitsTableExists: standardizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: standardizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: standardizabilityTableCoverage.billingRecordsTableExists,
    })

    return standardizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStandardizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStandardizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.standardizabilityStatusService.getWorkspaceStandardizabilityInventory(
        workspaceId,
      )
    const records = buildStandardizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.standardizabilityStatusService.pingPostgres()
    const stats = buildStandardizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return standardizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveStandardizabilityAdminActions(),
      guidance: getStandardizabilityAdminGuidance({ stats }),
    })
  }

  async executeStandardizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_standardizability_summary'
    },
  ) {
    this.assertCanManageStandardizability(authContext)

    const payload = standardizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_standardizability_summary': {
        const summary = await this.getWorkspaceStandardizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return standardizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed standardizability summary with ${summary.stats.standardizabilityPercent}% workspace limit standardizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStandardizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production standardizability tools.',
    })
  }
}
