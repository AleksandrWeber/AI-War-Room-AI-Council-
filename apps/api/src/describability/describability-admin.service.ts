import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDescribabilityRolloutGuidance,
  describabilityAdminActionRequestSchema,
  describabilityAdminActionResponseSchema,
  describabilityAdminSummaryResponseSchema,
  describabilityCapabilitiesResponseSchema,
  describabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDescribabilityAdminRecords,
  buildDescribabilityAdminStats,
  getDescribabilityAdminGuidance,
  resolveDescribabilityAdminActions,
} from './describability-admin.helpers.js'
import { evaluateDescribabilityRollout } from './describability-rollout.helpers.js'
import { DescribabilityStatusService } from './describability-status.service.js'

@Injectable()
export class DescribabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly describabilityStatusService: DescribabilityStatusService,
  ) {}

  getCapabilities() {
    return describabilityCapabilitiesResponseSchema.parse({
      supportsDescribabilityRollout: true,
      supportsDescribabilityAdminTools: true,
      supportsWorkflowDescribabilitySignals: true,
      supportsAgentOutputDescribabilitySignals: true,
      guidance: getDescribabilityRolloutGuidance(),
    })
  }

  async getDescribabilityRollout() {
    const describabilityTableCoverage =
      await this.describabilityStatusService.getDescribabilityTableCoverage()

    const rollout = evaluateDescribabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.describabilityStatusService.pingPostgres(),
      existingDescribabilityTableCount: describabilityTableCoverage.existingDescribabilityTableCount,
      runWorkflowsTableExists: describabilityTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: describabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: describabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return describabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDescribabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDescribability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.describabilityStatusService.getWorkspaceDescribabilityInventory(
        workspaceId,
      )
    const records = buildDescribabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.describabilityStatusService.pingPostgres()
    const stats = buildDescribabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return describabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDescribabilityAdminActions(),
      guidance: getDescribabilityAdminGuidance({ stats }),
    })
  }

  async executeDescribabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_describability_summary'
    },
  ) {
    this.assertCanManageDescribability(authContext)

    const payload = describabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_describability_summary': {
        const summary = await this.getWorkspaceDescribabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return describabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed describability summary with ${summary.stats.describabilityPercent}% workflow describability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDescribability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production describability tools.',
    })
  }
}
