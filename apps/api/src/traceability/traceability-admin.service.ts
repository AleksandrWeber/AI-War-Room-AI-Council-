import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTraceabilityRolloutGuidance,
  traceabilityAdminActionRequestSchema,
  traceabilityAdminActionResponseSchema,
  traceabilityAdminSummaryResponseSchema,
  traceabilityCapabilitiesResponseSchema,
  traceabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTraceabilityAdminRecords,
  buildTraceabilityAdminStats,
  getTraceabilityAdminGuidance,
  resolveTraceabilityAdminActions,
} from './traceability-admin.helpers.js'
import { evaluateTraceabilityRollout } from './traceability-rollout.helpers.js'
import { TraceabilityStatusService } from './traceability-status.service.js'

@Injectable()
export class TraceabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly traceabilityStatusService: TraceabilityStatusService,
  ) {}

  getCapabilities() {
    return traceabilityCapabilitiesResponseSchema.parse({
      supportsTraceabilityRollout: true,
      supportsTraceabilityAdminTools: true,
      supportsRunLineageSignals: true,
      supportsArtifactLineageSignals: true,
      guidance: getTraceabilityRolloutGuidance(),
    })
  }

  async getTraceabilityRollout() {
    const traceabilityTableCoverage =
      await this.traceabilityStatusService.getTraceabilityTableCoverage()

    const rollout = evaluateTraceabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.traceabilityStatusService.pingPostgres(),
      existingTraceabilityTableCount:
        traceabilityTableCoverage.existingTraceabilityTableCount,
      artifactsTableExists: traceabilityTableCoverage.artifactsTableExists,
      usageEventsTableExists: traceabilityTableCoverage.usageEventsTableExists,
    })

    return traceabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTraceabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTraceability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.traceabilityStatusService.getWorkspaceTraceabilityInventory(
        workspaceId,
      )
    const records = buildTraceabilityAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.traceabilityStatusService.pingPostgres()
    const stats = buildTraceabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return traceabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTraceabilityAdminActions(),
      guidance: getTraceabilityAdminGuidance({ stats }),
    })
  }

  async executeTraceabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_traceability_summary'
    },
  ) {
    this.assertCanManageTraceability(authContext)

    const payload = traceabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_traceability_summary': {
        const summary = await this.getWorkspaceTraceabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return traceabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed traceability summary with ${summary.stats.traceabilityPercent}% artifact lineage across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTraceability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production traceability tools.',
    })
  }
}
