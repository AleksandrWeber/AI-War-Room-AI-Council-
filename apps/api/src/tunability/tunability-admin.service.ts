import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTunabilityRolloutGuidance,
  tunabilityAdminActionRequestSchema,
  tunabilityAdminActionResponseSchema,
  tunabilityAdminSummaryResponseSchema,
  tunabilityCapabilitiesResponseSchema,
  tunabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTunabilityAdminRecords,
  buildTunabilityAdminStats,
  getTunabilityAdminGuidance,
  resolveTunabilityAdminActions,
} from './tunability-admin.helpers.js'
import { evaluateTunabilityRollout } from './tunability-rollout.helpers.js'
import { TunabilityStatusService } from './tunability-status.service.js'

@Injectable()
export class TunabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly tunabilityStatusService: TunabilityStatusService,
  ) {}

  getCapabilities() {
    return tunabilityCapabilitiesResponseSchema.parse({
      supportsTunabilityRollout: true,
      supportsTunabilityAdminTools: true,
      supportsUsageEventTunabilitySignals: true,
      supportsWorkspaceLimitTunabilitySignals: true,
      guidance: getTunabilityRolloutGuidance(),
    })
  }

  async getTunabilityRollout() {
    const tunabilityTableCoverage =
      await this.tunabilityStatusService.getTunabilityTableCoverage()

    const rollout = evaluateTunabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.tunabilityStatusService.pingPostgres(),
      existingTunabilityTableCount: tunabilityTableCoverage.existingTunabilityTableCount,
      usageEventsTableExists: tunabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: tunabilityTableCoverage.workspaceUsageLimitsTableExists,
      idempotencyKeysTableExists: tunabilityTableCoverage.idempotencyKeysTableExists,
    })

    return tunabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTunabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTunability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.tunabilityStatusService.getWorkspaceTunabilityInventory(
        workspaceId,
      )
    const records = buildTunabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.tunabilityStatusService.pingPostgres()
    const stats = buildTunabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return tunabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTunabilityAdminActions(),
      guidance: getTunabilityAdminGuidance({ stats }),
    })
  }

  async executeTunabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_tunability_summary'
    },
  ) {
    this.assertCanManageTunability(authContext)

    const payload = tunabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_tunability_summary': {
        const summary = await this.getWorkspaceTunabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return tunabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed tunability summary with ${summary.stats.tunabilityPercent}% usage event tunability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTunability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production tunability tools.',
    })
  }
}
