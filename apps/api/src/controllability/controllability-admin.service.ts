import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getControllabilityRolloutGuidance,
  controllabilityAdminActionRequestSchema,
  controllabilityAdminActionResponseSchema,
  controllabilityAdminSummaryResponseSchema,
  controllabilityCapabilitiesResponseSchema,
  controllabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildControllabilityAdminRecords,
  buildControllabilityAdminStats,
  getControllabilityAdminGuidance,
  resolveControllabilityAdminActions,
} from './controllability-admin.helpers.js'
import { evaluateControllabilityRollout } from './controllability-rollout.helpers.js'
import { ControllabilityStatusService } from './controllability-status.service.js'

@Injectable()
export class ControllabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly controllabilityStatusService: ControllabilityStatusService,
  ) {}

  getCapabilities() {
    return controllabilityCapabilitiesResponseSchema.parse({
      supportsControllabilityRollout: true,
      supportsControllabilityAdminTools: true,
      supportsIdempotencyKeyControllabilitySignals: true,
      supportsWorkspaceLimitControllabilitySignals: true,
      guidance: getControllabilityRolloutGuidance(),
    })
  }

  async getControllabilityRollout() {
    const controllabilityTableCoverage =
      await this.controllabilityStatusService.getControllabilityTableCoverage()

    const rollout = evaluateControllabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.controllabilityStatusService.pingPostgres(),
      existingControllabilityTableCount: controllabilityTableCoverage.existingControllabilityTableCount,
      idempotencyKeysTableExists: controllabilityTableCoverage.idempotencyKeysTableExists,
      workspaceUsageLimitsTableExists: controllabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: controllabilityTableCoverage.usageEventsTableExists,
    })

    return controllabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceControllabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageControllability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.controllabilityStatusService.getWorkspaceControllabilityInventory(
        workspaceId,
      )
    const records = buildControllabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.controllabilityStatusService.pingPostgres()
    const stats = buildControllabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return controllabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveControllabilityAdminActions(),
      guidance: getControllabilityAdminGuidance({ stats }),
    })
  }

  async executeControllabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_controllability_summary'
    },
  ) {
    this.assertCanManageControllability(authContext)

    const payload = controllabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_controllability_summary': {
        const summary = await this.getWorkspaceControllabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return controllabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed controllability summary with ${summary.stats.controllabilityPercent}% idempotency key controllability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageControllability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production controllability tools.',
    })
  }
}
