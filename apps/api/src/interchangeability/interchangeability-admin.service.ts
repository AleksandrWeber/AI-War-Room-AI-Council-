import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInterchangeabilityRolloutGuidance,
  interchangeabilityAdminActionRequestSchema,
  interchangeabilityAdminActionResponseSchema,
  interchangeabilityAdminSummaryResponseSchema,
  interchangeabilityCapabilitiesResponseSchema,
  interchangeabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInterchangeabilityAdminRecords,
  buildInterchangeabilityAdminStats,
  getInterchangeabilityAdminGuidance,
  resolveInterchangeabilityAdminActions,
} from './interchangeability-admin.helpers.js'
import { evaluateInterchangeabilityRollout } from './interchangeability-rollout.helpers.js'
import { InterchangeabilityStatusService } from './interchangeability-status.service.js'

@Injectable()
export class InterchangeabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly interchangeabilityStatusService: InterchangeabilityStatusService,
  ) {}

  getCapabilities() {
    return interchangeabilityCapabilitiesResponseSchema.parse({
      supportsInterchangeabilityRollout: true,
      supportsInterchangeabilityAdminTools: true,
      supportsMeterUsageInterchangeabilitySignals: true,
      supportsIdempotencyKeyInterchangeabilitySignals: true,
      guidance: getInterchangeabilityRolloutGuidance(),
    })
  }

  async getInterchangeabilityRollout() {
    const interchangeabilityTableCoverage =
      await this.interchangeabilityStatusService.getInterchangeabilityTableCoverage()

    const rollout = evaluateInterchangeabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.interchangeabilityStatusService.pingPostgres(),
      existingInterchangeabilityTableCount: interchangeabilityTableCoverage.existingInterchangeabilityTableCount,
      billingMeterUsageReportsTableExists: interchangeabilityTableCoverage.billingMeterUsageReportsTableExists,
      idempotencyKeysTableExists: interchangeabilityTableCoverage.idempotencyKeysTableExists,
      workspaceUsageLimitsTableExists: interchangeabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return interchangeabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInterchangeabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInterchangeability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.interchangeabilityStatusService.getWorkspaceInterchangeabilityInventory(
        workspaceId,
      )
    const records = buildInterchangeabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.interchangeabilityStatusService.pingPostgres()
    const stats = buildInterchangeabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return interchangeabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInterchangeabilityAdminActions(),
      guidance: getInterchangeabilityAdminGuidance({ stats }),
    })
  }

  async executeInterchangeabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_interchangeability_summary'
    },
  ) {
    this.assertCanManageInterchangeability(authContext)

    const payload = interchangeabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_interchangeability_summary': {
        const summary = await this.getWorkspaceInterchangeabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return interchangeabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed interchangeability summary with ${summary.stats.interchangeabilityPercent}% meter usage interchangeability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInterchangeability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production interchangeability tools.',
    })
  }
}
