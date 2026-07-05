import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getParametrizabilityRolloutGuidance,
  parametrizabilityAdminActionRequestSchema,
  parametrizabilityAdminActionResponseSchema,
  parametrizabilityAdminSummaryResponseSchema,
  parametrizabilityCapabilitiesResponseSchema,
  parametrizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildParametrizabilityAdminRecords,
  buildParametrizabilityAdminStats,
  getParametrizabilityAdminGuidance,
  resolveParametrizabilityAdminActions,
} from './parametrizability-admin.helpers.js'
import { evaluateParametrizabilityRollout } from './parametrizability-rollout.helpers.js'
import { ParametrizabilityStatusService } from './parametrizability-status.service.js'

@Injectable()
export class ParametrizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly parametrizabilityStatusService: ParametrizabilityStatusService,
  ) {}

  getCapabilities() {
    return parametrizabilityCapabilitiesResponseSchema.parse({
      supportsParametrizabilityRollout: true,
      supportsParametrizabilityAdminTools: true,
      supportsWorkspaceLimitParametrizabilitySignals: true,
      supportsUsageEventParametrizabilitySignals: true,
      guidance: getParametrizabilityRolloutGuidance(),
    })
  }

  async getParametrizabilityRollout() {
    const parametrizabilityTableCoverage =
      await this.parametrizabilityStatusService.getParametrizabilityTableCoverage()

    const rollout = evaluateParametrizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.parametrizabilityStatusService.pingPostgres(),
      existingParametrizabilityTableCount: parametrizabilityTableCoverage.existingParametrizabilityTableCount,
      workspaceUsageLimitsTableExists: parametrizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: parametrizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: parametrizabilityTableCoverage.billingRecordsTableExists,
    })

    return parametrizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceParametrizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageParametrizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.parametrizabilityStatusService.getWorkspaceParametrizabilityInventory(
        workspaceId,
      )
    const records = buildParametrizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.parametrizabilityStatusService.pingPostgres()
    const stats = buildParametrizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return parametrizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveParametrizabilityAdminActions(),
      guidance: getParametrizabilityAdminGuidance({ stats }),
    })
  }

  async executeParametrizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_parametrizability_summary'
    },
  ) {
    this.assertCanManageParametrizability(authContext)

    const payload = parametrizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_parametrizability_summary': {
        const summary = await this.getWorkspaceParametrizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return parametrizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed parametrizability summary with ${summary.stats.parametrizabilityPercent}% workspace limit parametrizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageParametrizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production parametrizability tools.',
    })
  }
}
