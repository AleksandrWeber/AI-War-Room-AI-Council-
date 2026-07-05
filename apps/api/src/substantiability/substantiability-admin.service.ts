import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSubstantiabilityRolloutGuidance,
  substantiabilityAdminActionRequestSchema,
  substantiabilityAdminActionResponseSchema,
  substantiabilityAdminSummaryResponseSchema,
  substantiabilityCapabilitiesResponseSchema,
  substantiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSubstantiabilityAdminRecords,
  buildSubstantiabilityAdminStats,
  getSubstantiabilityAdminGuidance,
  resolveSubstantiabilityAdminActions,
} from './substantiability-admin.helpers.js'
import { evaluateSubstantiabilityRollout } from './substantiability-rollout.helpers.js'
import { SubstantiabilityStatusService } from './substantiability-status.service.js'

@Injectable()
export class SubstantiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly substantiabilityStatusService: SubstantiabilityStatusService,
  ) {}

  getCapabilities() {
    return substantiabilityCapabilitiesResponseSchema.parse({
      supportsSubstantiabilityRollout: true,
      supportsSubstantiabilityAdminTools: true,
      supportsBillingRecordSubstantiabilitySignals: true,
      supportsBillingWebhookSubstantiabilitySignals: true,
      guidance: getSubstantiabilityRolloutGuidance(),
    })
  }

  async getSubstantiabilityRollout() {
    const substantiabilityTableCoverage =
      await this.substantiabilityStatusService.getSubstantiabilityTableCoverage()

    const rollout = evaluateSubstantiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.substantiabilityStatusService.pingPostgres(),
      existingSubstantiabilityTableCount: substantiabilityTableCoverage.existingSubstantiabilityTableCount,
      billingRecordsTableExists: substantiabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: substantiabilityTableCoverage.billingWebhookEventsTableExists,
      idempotencyKeysTableExists: substantiabilityTableCoverage.idempotencyKeysTableExists,
    })

    return substantiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSubstantiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSubstantiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.substantiabilityStatusService.getWorkspaceSubstantiabilityInventory(
        workspaceId,
      )
    const records = buildSubstantiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.substantiabilityStatusService.pingPostgres()
    const stats = buildSubstantiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return substantiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSubstantiabilityAdminActions(),
      guidance: getSubstantiabilityAdminGuidance({ stats }),
    })
  }

  async executeSubstantiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_substantiability_summary'
    },
  ) {
    this.assertCanManageSubstantiability(authContext)

    const payload = substantiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_substantiability_summary': {
        const summary = await this.getWorkspaceSubstantiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return substantiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed substantiability summary with ${summary.stats.substantiabilityPercent}% billing record substantiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSubstantiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production substantiability tools.',
    })
  }
}
