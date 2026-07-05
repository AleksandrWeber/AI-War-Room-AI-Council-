import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFormulatabilityRolloutGuidance,
  formulatabilityAdminActionRequestSchema,
  formulatabilityAdminActionResponseSchema,
  formulatabilityAdminSummaryResponseSchema,
  formulatabilityCapabilitiesResponseSchema,
  formulatabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFormulatabilityAdminRecords,
  buildFormulatabilityAdminStats,
  getFormulatabilityAdminGuidance,
  resolveFormulatabilityAdminActions,
} from './formulatability-admin.helpers.js'
import { evaluateFormulatabilityRollout } from './formulatability-rollout.helpers.js'
import { FormulatabilityStatusService } from './formulatability-status.service.js'

@Injectable()
export class FormulatabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly formulatabilityStatusService: FormulatabilityStatusService,
  ) {}

  getCapabilities() {
    return formulatabilityCapabilitiesResponseSchema.parse({
      supportsFormulatabilityRollout: true,
      supportsFormulatabilityAdminTools: true,
      supportsIdempotencyKeyFormulatabilitySignals: true,
      supportsUsageEventFormulatabilitySignals: true,
      guidance: getFormulatabilityRolloutGuidance(),
    })
  }

  async getFormulatabilityRollout() {
    const formulatabilityTableCoverage =
      await this.formulatabilityStatusService.getFormulatabilityTableCoverage()

    const rollout = evaluateFormulatabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.formulatabilityStatusService.pingPostgres(),
      existingFormulatabilityTableCount: formulatabilityTableCoverage.existingFormulatabilityTableCount,
      idempotencyKeysTableExists: formulatabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: formulatabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: formulatabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return formulatabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFormulatabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFormulatability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.formulatabilityStatusService.getWorkspaceFormulatabilityInventory(
        workspaceId,
      )
    const records = buildFormulatabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.formulatabilityStatusService.pingPostgres()
    const stats = buildFormulatabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return formulatabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFormulatabilityAdminActions(),
      guidance: getFormulatabilityAdminGuidance({ stats }),
    })
  }

  async executeFormulatabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_formulatability_summary'
    },
  ) {
    this.assertCanManageFormulatability(authContext)

    const payload = formulatabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_formulatability_summary': {
        const summary = await this.getWorkspaceFormulatabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return formulatabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed formulatability summary with ${summary.stats.formulatabilityPercent}% idempotency key formulatability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFormulatability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production formulatability tools.',
    })
  }
}
