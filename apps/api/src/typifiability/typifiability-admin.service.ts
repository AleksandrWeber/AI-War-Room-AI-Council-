import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTypifiabilityRolloutGuidance,
  typifiabilityAdminActionRequestSchema,
  typifiabilityAdminActionResponseSchema,
  typifiabilityAdminSummaryResponseSchema,
  typifiabilityCapabilitiesResponseSchema,
  typifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTypifiabilityAdminRecords,
  buildTypifiabilityAdminStats,
  getTypifiabilityAdminGuidance,
  resolveTypifiabilityAdminActions,
} from './typifiability-admin.helpers.js'
import { evaluateTypifiabilityRollout } from './typifiability-rollout.helpers.js'
import { TypifiabilityStatusService } from './typifiability-status.service.js'

@Injectable()
export class TypifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly typifiabilityStatusService: TypifiabilityStatusService,
  ) {}

  getCapabilities() {
    return typifiabilityCapabilitiesResponseSchema.parse({
      supportsTypifiabilityRollout: true,
      supportsTypifiabilityAdminTools: true,
      supportsWorkspaceLimitTypifiabilitySignals: true,
      supportsUsageEventTypifiabilitySignals: true,
      guidance: getTypifiabilityRolloutGuidance(),
    })
  }

  async getTypifiabilityRollout() {
    const typifiabilityTableCoverage =
      await this.typifiabilityStatusService.getTypifiabilityTableCoverage()

    const rollout = evaluateTypifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.typifiabilityStatusService.pingPostgres(),
      existingTypifiabilityTableCount: typifiabilityTableCoverage.existingTypifiabilityTableCount,
      workspaceUsageLimitsTableExists: typifiabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: typifiabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: typifiabilityTableCoverage.billingRecordsTableExists,
    })

    return typifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTypifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTypifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.typifiabilityStatusService.getWorkspaceTypifiabilityInventory(
        workspaceId,
      )
    const records = buildTypifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.typifiabilityStatusService.pingPostgres()
    const stats = buildTypifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return typifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTypifiabilityAdminActions(),
      guidance: getTypifiabilityAdminGuidance({ stats }),
    })
  }

  async executeTypifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_typifiability_summary'
    },
  ) {
    this.assertCanManageTypifiability(authContext)

    const payload = typifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_typifiability_summary': {
        const summary = await this.getWorkspaceTypifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return typifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed typifiability summary with ${summary.stats.typifiabilityPercent}% workspace limit typifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTypifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production typifiability tools.',
    })
  }
}
