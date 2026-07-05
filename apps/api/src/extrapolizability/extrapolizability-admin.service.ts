import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExtrapolizabilityRolloutGuidance,
  extrapolizabilityAdminActionRequestSchema,
  extrapolizabilityAdminActionResponseSchema,
  extrapolizabilityAdminSummaryResponseSchema,
  extrapolizabilityCapabilitiesResponseSchema,
  extrapolizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExtrapolizabilityAdminRecords,
  buildExtrapolizabilityAdminStats,
  getExtrapolizabilityAdminGuidance,
  resolveExtrapolizabilityAdminActions,
} from './extrapolizability-admin.helpers.js'
import { evaluateExtrapolizabilityRollout } from './extrapolizability-rollout.helpers.js'
import { ExtrapolizabilityStatusService } from './extrapolizability-status.service.js'

@Injectable()
export class ExtrapolizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly extrapolizabilityStatusService: ExtrapolizabilityStatusService,
  ) {}

  getCapabilities() {
    return extrapolizabilityCapabilitiesResponseSchema.parse({
      supportsExtrapolizabilityRollout: true,
      supportsExtrapolizabilityAdminTools: true,
      supportsModelHealthExtrapolizabilitySignals: true,
      supportsModelRegistryExtrapolizabilitySignals: true,
      guidance: getExtrapolizabilityRolloutGuidance(),
    })
  }

  async getExtrapolizabilityRollout() {
    const extrapolizabilityTableCoverage =
      await this.extrapolizabilityStatusService.getExtrapolizabilityTableCoverage()

    const rollout = evaluateExtrapolizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.extrapolizabilityStatusService.pingPostgres(),
      existingExtrapolizabilityTableCount: extrapolizabilityTableCoverage.existingExtrapolizabilityTableCount,
      modelHealthEventsTableExists: extrapolizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: extrapolizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: extrapolizabilityTableCoverage.billingRecordsTableExists,
    })

    return extrapolizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExtrapolizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExtrapolizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.extrapolizabilityStatusService.getWorkspaceExtrapolizabilityInventory(
        workspaceId,
      )
    const records = buildExtrapolizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.extrapolizabilityStatusService.pingPostgres()
    const stats = buildExtrapolizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return extrapolizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExtrapolizabilityAdminActions(),
      guidance: getExtrapolizabilityAdminGuidance({ stats }),
    })
  }

  async executeExtrapolizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_extrapolizability_summary'
    },
  ) {
    this.assertCanManageExtrapolizability(authContext)

    const payload = extrapolizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_extrapolizability_summary': {
        const summary = await this.getWorkspaceExtrapolizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return extrapolizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed extrapolizability summary with ${summary.stats.extrapolizabilityPercent}% model health extrapolizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExtrapolizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production extrapolizability tools.',
    })
  }
}
