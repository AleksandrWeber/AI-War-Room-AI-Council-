import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompressizabilityRolloutGuidance,
  compressizabilityAdminActionRequestSchema,
  compressizabilityAdminActionResponseSchema,
  compressizabilityAdminSummaryResponseSchema,
  compressizabilityCapabilitiesResponseSchema,
  compressizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompressizabilityAdminRecords,
  buildCompressizabilityAdminStats,
  getCompressizabilityAdminGuidance,
  resolveCompressizabilityAdminActions,
} from './compressizability-admin.helpers.js'
import { evaluateCompressizabilityRollout } from './compressizability-rollout.helpers.js'
import { CompressizabilityStatusService } from './compressizability-status.service.js'

@Injectable()
export class CompressizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compressizabilityStatusService: CompressizabilityStatusService,
  ) {}

  getCapabilities() {
    return compressizabilityCapabilitiesResponseSchema.parse({
      supportsCompressizabilityRollout: true,
      supportsCompressizabilityAdminTools: true,
      supportsMembershipCompressizabilitySignals: true,
      supportsUsageEventCompressizabilitySignals: true,
      guidance: getCompressizabilityRolloutGuidance(),
    })
  }

  async getCompressizabilityRollout() {
    const compressizabilityTableCoverage =
      await this.compressizabilityStatusService.getCompressizabilityTableCoverage()

    const rollout = evaluateCompressizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compressizabilityStatusService.pingPostgres(),
      existingCompressizabilityTableCount: compressizabilityTableCoverage.existingCompressizabilityTableCount,
      workspaceMembershipsTableExists: compressizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: compressizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: compressizabilityTableCoverage.billingNotificationsTableExists,
    })

    return compressizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompressizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompressizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compressizabilityStatusService.getWorkspaceCompressizabilityInventory(
        workspaceId,
      )
    const records = buildCompressizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compressizabilityStatusService.pingPostgres()
    const stats = buildCompressizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compressizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompressizabilityAdminActions(),
      guidance: getCompressizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompressizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compressizability_summary'
    },
  ) {
    this.assertCanManageCompressizability(authContext)

    const payload = compressizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compressizability_summary': {
        const summary = await this.getWorkspaceCompressizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compressizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compressizability summary with ${summary.stats.compressizabilityPercent}% membership compressizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompressizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compressizability tools.',
    })
  }
}
