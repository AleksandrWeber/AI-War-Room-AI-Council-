import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNormalizabilityRolloutGuidance,
  normalizabilityAdminActionRequestSchema,
  normalizabilityAdminActionResponseSchema,
  normalizabilityAdminSummaryResponseSchema,
  normalizabilityCapabilitiesResponseSchema,
  normalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNormalizabilityAdminRecords,
  buildNormalizabilityAdminStats,
  getNormalizabilityAdminGuidance,
  resolveNormalizabilityAdminActions,
} from './normalizability-admin.helpers.js'
import { evaluateNormalizabilityRollout } from './normalizability-rollout.helpers.js'
import { NormalizabilityStatusService } from './normalizability-status.service.js'

@Injectable()
export class NormalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly normalizabilityStatusService: NormalizabilityStatusService,
  ) {}

  getCapabilities() {
    return normalizabilityCapabilitiesResponseSchema.parse({
      supportsNormalizabilityRollout: true,
      supportsNormalizabilityAdminTools: true,
      supportsModelHealthNormalizabilitySignals: true,
      supportsModelRegistryNormalizabilitySignals: true,
      guidance: getNormalizabilityRolloutGuidance(),
    })
  }

  async getNormalizabilityRollout() {
    const normalizabilityTableCoverage =
      await this.normalizabilityStatusService.getNormalizabilityTableCoverage()

    const rollout = evaluateNormalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.normalizabilityStatusService.pingPostgres(),
      existingNormalizabilityTableCount: normalizabilityTableCoverage.existingNormalizabilityTableCount,
      modelHealthEventsTableExists: normalizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: normalizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: normalizabilityTableCoverage.billingRecordsTableExists,
    })

    return normalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNormalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNormalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.normalizabilityStatusService.getWorkspaceNormalizabilityInventory(
        workspaceId,
      )
    const records = buildNormalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.normalizabilityStatusService.pingPostgres()
    const stats = buildNormalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return normalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNormalizabilityAdminActions(),
      guidance: getNormalizabilityAdminGuidance({ stats }),
    })
  }

  async executeNormalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_normalizability_summary'
    },
  ) {
    this.assertCanManageNormalizability(authContext)

    const payload = normalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_normalizability_summary': {
        const summary = await this.getWorkspaceNormalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return normalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed normalizability summary with ${summary.stats.normalizabilityPercent}% model health normalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNormalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production normalizability tools.',
    })
  }
}
