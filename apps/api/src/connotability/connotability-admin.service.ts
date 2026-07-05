import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConnotabilityRolloutGuidance,
  connotabilityAdminActionRequestSchema,
  connotabilityAdminActionResponseSchema,
  connotabilityAdminSummaryResponseSchema,
  connotabilityCapabilitiesResponseSchema,
  connotabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConnotabilityAdminRecords,
  buildConnotabilityAdminStats,
  getConnotabilityAdminGuidance,
  resolveConnotabilityAdminActions,
} from './connotability-admin.helpers.js'
import { evaluateConnotabilityRollout } from './connotability-rollout.helpers.js'
import { ConnotabilityStatusService } from './connotability-status.service.js'

@Injectable()
export class ConnotabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly connotabilityStatusService: ConnotabilityStatusService,
  ) {}

  getCapabilities() {
    return connotabilityCapabilitiesResponseSchema.parse({
      supportsConnotabilityRollout: true,
      supportsConnotabilityAdminTools: true,
      supportsMeterUsageConnotabilitySignals: true,
      supportsUsageEventConnotabilitySignals: true,
      guidance: getConnotabilityRolloutGuidance(),
    })
  }

  async getConnotabilityRollout() {
    const connotabilityTableCoverage =
      await this.connotabilityStatusService.getConnotabilityTableCoverage()

    const rollout = evaluateConnotabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.connotabilityStatusService.pingPostgres(),
      existingConnotabilityTableCount: connotabilityTableCoverage.existingConnotabilityTableCount,
      billingMeterUsageReportsTableExists: connotabilityTableCoverage.billingMeterUsageReportsTableExists,
      usageEventsTableExists: connotabilityTableCoverage.usageEventsTableExists,
      workspaceUsageLimitsTableExists: connotabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return connotabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConnotabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConnotability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.connotabilityStatusService.getWorkspaceConnotabilityInventory(
        workspaceId,
      )
    const records = buildConnotabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.connotabilityStatusService.pingPostgres()
    const stats = buildConnotabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return connotabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConnotabilityAdminActions(),
      guidance: getConnotabilityAdminGuidance({ stats }),
    })
  }

  async executeConnotabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_connotability_summary'
    },
  ) {
    this.assertCanManageConnotability(authContext)

    const payload = connotabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_connotability_summary': {
        const summary = await this.getWorkspaceConnotabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return connotabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed connotability summary with ${summary.stats.connotabilityPercent}% meter usage connotability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConnotability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production connotability tools.',
    })
  }
}
