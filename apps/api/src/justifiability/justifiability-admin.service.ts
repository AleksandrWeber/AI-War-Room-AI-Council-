import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getJustifiabilityRolloutGuidance,
  justifiabilityAdminActionRequestSchema,
  justifiabilityAdminActionResponseSchema,
  justifiabilityAdminSummaryResponseSchema,
  justifiabilityCapabilitiesResponseSchema,
  justifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildJustifiabilityAdminRecords,
  buildJustifiabilityAdminStats,
  getJustifiabilityAdminGuidance,
  resolveJustifiabilityAdminActions,
} from './justifiability-admin.helpers.js'
import { evaluateJustifiabilityRollout } from './justifiability-rollout.helpers.js'
import { JustifiabilityStatusService } from './justifiability-status.service.js'

@Injectable()
export class JustifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly justifiabilityStatusService: JustifiabilityStatusService,
  ) {}

  getCapabilities() {
    return justifiabilityCapabilitiesResponseSchema.parse({
      supportsJustifiabilityRollout: true,
      supportsJustifiabilityAdminTools: true,
      supportsShieldReviewJustifiabilitySignals: true,
      supportsBillingWebhookJustifiabilitySignals: true,
      guidance: getJustifiabilityRolloutGuidance(),
    })
  }

  async getJustifiabilityRollout() {
    const justifiabilityTableCoverage =
      await this.justifiabilityStatusService.getJustifiabilityTableCoverage()

    const rollout = evaluateJustifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.justifiabilityStatusService.pingPostgres(),
      existingJustifiabilityTableCount: justifiabilityTableCoverage.existingJustifiabilityTableCount,
      shieldScansTableExists: justifiabilityTableCoverage.shieldScansTableExists,
      billingWebhookEventsTableExists: justifiabilityTableCoverage.billingWebhookEventsTableExists,
      idempotencyKeysTableExists: justifiabilityTableCoverage.idempotencyKeysTableExists,
    })

    return justifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceJustifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageJustifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.justifiabilityStatusService.getWorkspaceJustifiabilityInventory(
        workspaceId,
      )
    const records = buildJustifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.justifiabilityStatusService.pingPostgres()
    const stats = buildJustifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return justifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveJustifiabilityAdminActions(),
      guidance: getJustifiabilityAdminGuidance({ stats }),
    })
  }

  async executeJustifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_justifiability_summary'
    },
  ) {
    this.assertCanManageJustifiability(authContext)

    const payload = justifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_justifiability_summary': {
        const summary = await this.getWorkspaceJustifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return justifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed justifiability summary with ${summary.stats.justifiabilityPercent}% shield review justifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageJustifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production justifiability tools.',
    })
  }
}
