import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTraceledgerizabilityRolloutGuidance,
  traceledgerizabilityAdminActionRequestSchema,
  traceledgerizabilityAdminActionResponseSchema,
  traceledgerizabilityAdminSummaryResponseSchema,
  traceledgerizabilityCapabilitiesResponseSchema,
  traceledgerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTraceledgerizabilityAdminRecords,
  buildTraceledgerizabilityAdminStats,
  getTraceledgerizabilityAdminGuidance,
  resolveTraceledgerizabilityAdminActions,
} from './traceledgerizability-admin.helpers.js'
import { evaluateTraceledgerizabilityRollout } from './traceledgerizability-rollout.helpers.js'
import { TraceledgerizabilityStatusService } from './traceledgerizability-status.service.js'

@Injectable()
export class TraceledgerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly traceledgerizabilityStatusService: TraceledgerizabilityStatusService,
  ) {}

  getCapabilities() {
    return traceledgerizabilityCapabilitiesResponseSchema.parse({
      supportsTraceledgerizabilityRollout: true,
      supportsTraceledgerizabilityAdminTools: true,
      supportsMembershipTraceledgerizabilitySignals: true,
      supportsUsageEventTraceledgerizabilitySignals: true,
      guidance: getTraceledgerizabilityRolloutGuidance(),
    })
  }

  async getTraceledgerizabilityRollout() {
    const traceledgerizabilityTableCoverage =
      await this.traceledgerizabilityStatusService.getTraceledgerizabilityTableCoverage()

    const rollout = evaluateTraceledgerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.traceledgerizabilityStatusService.pingPostgres(),
      existingTraceledgerizabilityTableCount: traceledgerizabilityTableCoverage.existingTraceledgerizabilityTableCount,
      workspaceMembershipsTableExists: traceledgerizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: traceledgerizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: traceledgerizabilityTableCoverage.billingNotificationsTableExists,
    })

    return traceledgerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTraceledgerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTraceledgerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.traceledgerizabilityStatusService.getWorkspaceTraceledgerizabilityInventory(
        workspaceId,
      )
    const records = buildTraceledgerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.traceledgerizabilityStatusService.pingPostgres()
    const stats = buildTraceledgerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return traceledgerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTraceledgerizabilityAdminActions(),
      guidance: getTraceledgerizabilityAdminGuidance({ stats }),
    })
  }

  async executeTraceledgerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_traceledgerizability_summary'
    },
  ) {
    this.assertCanManageTraceledgerizability(authContext)

    const payload = traceledgerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_traceledgerizability_summary': {
        const summary = await this.getWorkspaceTraceledgerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return traceledgerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed traceledgerizability summary with ${summary.stats.traceledgerizabilityPercent}% membership traceledgerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTraceledgerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production traceledgerizability tools.',
    })
  }
}
