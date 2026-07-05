import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getInteroperabilizabilityRolloutGuidance,
  interoperabilizabilityAdminActionRequestSchema,
  interoperabilizabilityAdminActionResponseSchema,
  interoperabilizabilityAdminSummaryResponseSchema,
  interoperabilizabilityCapabilitiesResponseSchema,
  interoperabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildInteroperabilizabilityAdminRecords,
  buildInteroperabilizabilityAdminStats,
  getInteroperabilizabilityAdminGuidance,
  resolveInteroperabilizabilityAdminActions,
} from './interoperabilizability-admin.helpers.js'
import { evaluateInteroperabilizabilityRollout } from './interoperabilizability-rollout.helpers.js'
import { InteroperabilizabilityStatusService } from './interoperabilizability-status.service.js'

@Injectable()
export class InteroperabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly interoperabilizabilityStatusService: InteroperabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return interoperabilizabilityCapabilitiesResponseSchema.parse({
      supportsInteroperabilizabilityRollout: true,
      supportsInteroperabilizabilityAdminTools: true,
      supportsMeterUsageInteroperabilizabilitySignals: true,
      supportsUsageEventInteroperabilizabilitySignals: true,
      guidance: getInteroperabilizabilityRolloutGuidance(),
    })
  }

  async getInteroperabilizabilityRollout() {
    const interoperabilizabilityTableCoverage =
      await this.interoperabilizabilityStatusService.getInteroperabilizabilityTableCoverage()

    const rollout = evaluateInteroperabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.interoperabilizabilityStatusService.pingPostgres(),
      existingInteroperabilizabilityTableCount: interoperabilizabilityTableCoverage.existingInteroperabilizabilityTableCount,
      billingMeterUsageReportsTableExists: interoperabilizabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: interoperabilizabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: interoperabilizabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return interoperabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceInteroperabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageInteroperabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.interoperabilizabilityStatusService.getWorkspaceInteroperabilizabilityInventory(
        workspaceId,
      )
    const records = buildInteroperabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.interoperabilizabilityStatusService.pingPostgres()
    const stats = buildInteroperabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return interoperabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveInteroperabilizabilityAdminActions(),
      guidance: getInteroperabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeInteroperabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_interoperabilizability_summary'
    },
  ) {
    this.assertCanManageInteroperabilizability(authContext)

    const payload = interoperabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_interoperabilizability_summary': {
        const summary = await this.getWorkspaceInteroperabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return interoperabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed interoperabilizability summary with ${summary.stats.interoperabilizabilityPercent}% meter usage interoperabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageInteroperabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production interoperabilizability tools.',
    })
  }
}
