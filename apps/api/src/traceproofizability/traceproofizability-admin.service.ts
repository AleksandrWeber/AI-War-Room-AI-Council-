import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTraceproofizabilityRolloutGuidance,
  traceproofizabilityAdminActionRequestSchema,
  traceproofizabilityAdminActionResponseSchema,
  traceproofizabilityAdminSummaryResponseSchema,
  traceproofizabilityCapabilitiesResponseSchema,
  traceproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTraceproofizabilityAdminRecords,
  buildTraceproofizabilityAdminStats,
  getTraceproofizabilityAdminGuidance,
  resolveTraceproofizabilityAdminActions,
} from './traceproofizability-admin.helpers.js'
import { evaluateTraceproofizabilityRollout } from './traceproofizability-rollout.helpers.js'
import { TraceproofizabilityStatusService } from './traceproofizability-status.service.js'

@Injectable()
export class TraceproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly traceproofizabilityStatusService: TraceproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return traceproofizabilityCapabilitiesResponseSchema.parse({
      supportsTraceproofizabilityRollout: true,
      supportsTraceproofizabilityAdminTools: true,
      supportsMembershipTraceproofizabilitySignals: true,
      supportsUsageEventTraceproofizabilitySignals: true,
      guidance: getTraceproofizabilityRolloutGuidance(),
    })
  }

  async getTraceproofizabilityRollout() {
    const traceproofizabilityTableCoverage =
      await this.traceproofizabilityStatusService.getTraceproofizabilityTableCoverage()

    const rollout = evaluateTraceproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.traceproofizabilityStatusService.pingPostgres(),
      existingTraceproofizabilityTableCount: traceproofizabilityTableCoverage.existingTraceproofizabilityTableCount,
      workspaceMembershipsTableExists: traceproofizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: traceproofizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: traceproofizabilityTableCoverage.billingNotificationsTableExists,
    })

    return traceproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTraceproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTraceproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.traceproofizabilityStatusService.getWorkspaceTraceproofizabilityInventory(
        workspaceId,
      )
    const records = buildTraceproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.traceproofizabilityStatusService.pingPostgres()
    const stats = buildTraceproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return traceproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTraceproofizabilityAdminActions(),
      guidance: getTraceproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeTraceproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_traceproofizability_summary'
    },
  ) {
    this.assertCanManageTraceproofizability(authContext)

    const payload = traceproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_traceproofizability_summary': {
        const summary = await this.getWorkspaceTraceproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return traceproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed traceproofizability summary with ${summary.stats.traceproofizabilityPercent}% membership traceproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTraceproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production traceproofizability tools.',
    })
  }
}
