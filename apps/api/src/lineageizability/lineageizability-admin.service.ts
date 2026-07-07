import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLineageizabilityRolloutGuidance,
  lineageizabilityAdminActionRequestSchema,
  lineageizabilityAdminActionResponseSchema,
  lineageizabilityAdminSummaryResponseSchema,
  lineageizabilityCapabilitiesResponseSchema,
  lineageizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLineageizabilityAdminRecords,
  buildLineageizabilityAdminStats,
  getLineageizabilityAdminGuidance,
  resolveLineageizabilityAdminActions,
} from './lineageizability-admin.helpers.js'
import { evaluateLineageizabilityRollout } from './lineageizability-rollout.helpers.js'
import { LineageizabilityStatusService } from './lineageizability-status.service.js'

@Injectable()
export class LineageizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly lineageizabilityStatusService: LineageizabilityStatusService,
  ) {}

  getCapabilities() {
    return lineageizabilityCapabilitiesResponseSchema.parse({
      supportsLineageizabilityRollout: true,
      supportsLineageizabilityAdminTools: true,
      supportsMembershipLineageizabilitySignals: true,
      supportsUsageEventLineageizabilitySignals: true,
      guidance: getLineageizabilityRolloutGuidance(),
    })
  }

  async getLineageizabilityRollout() {
    const lineageizabilityTableCoverage =
      await this.lineageizabilityStatusService.getLineageizabilityTableCoverage()

    const rollout = evaluateLineageizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.lineageizabilityStatusService.pingPostgres(),
      existingLineageizabilityTableCount: lineageizabilityTableCoverage.existingLineageizabilityTableCount,
      workspaceMembershipsTableExists: lineageizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: lineageizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: lineageizabilityTableCoverage.billingNotificationsTableExists,
    })

    return lineageizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLineageizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLineageizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.lineageizabilityStatusService.getWorkspaceLineageizabilityInventory(
        workspaceId,
      )
    const records = buildLineageizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.lineageizabilityStatusService.pingPostgres()
    const stats = buildLineageizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return lineageizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLineageizabilityAdminActions(),
      guidance: getLineageizabilityAdminGuidance({ stats }),
    })
  }

  async executeLineageizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_lineageizability_summary'
    },
  ) {
    this.assertCanManageLineageizability(authContext)

    const payload = lineageizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_lineageizability_summary': {
        const summary = await this.getWorkspaceLineageizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return lineageizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed lineageizability summary with ${summary.stats.lineageizabilityPercent}% membership lineageizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLineageizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production lineageizability tools.',
    })
  }
}
