import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getViabilityRolloutGuidance,
  viabilityAdminActionRequestSchema,
  viabilityAdminActionResponseSchema,
  viabilityAdminSummaryResponseSchema,
  viabilityCapabilitiesResponseSchema,
  viabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildViabilityAdminRecords,
  buildViabilityAdminStats,
  getViabilityAdminGuidance,
  resolveViabilityAdminActions,
} from './viability-admin.helpers.js'
import { evaluateViabilityRollout } from './viability-rollout.helpers.js'
import { ViabilityStatusService } from './viability-status.service.js'

@Injectable()
export class ViabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly viabilityStatusService: ViabilityStatusService,
  ) {}

  getCapabilities() {
    return viabilityCapabilitiesResponseSchema.parse({
      supportsViabilityRollout: true,
      supportsViabilityAdminTools: true,
      supportsBillingInvoiceViabilitySignals: true,
      supportsBillingRecordViabilitySignals: true,
      guidance: getViabilityRolloutGuidance(),
    })
  }

  async getViabilityRollout() {
    const viabilityTableCoverage =
      await this.viabilityStatusService.getViabilityTableCoverage()

    const rollout = evaluateViabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.viabilityStatusService.pingPostgres(),
      existingViabilityTableCount: viabilityTableCoverage.existingViabilityTableCount,
      billingInvoicesTableExists: viabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: viabilityTableCoverage.billingRecordsTableExists,
      billingNotificationsTableExists: viabilityTableCoverage.billingNotificationsTableExists,
    })

    return viabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceViabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageViability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.viabilityStatusService.getWorkspaceViabilityInventory(
        workspaceId,
      )
    const records = buildViabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.viabilityStatusService.pingPostgres()
    const stats = buildViabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return viabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveViabilityAdminActions(),
      guidance: getViabilityAdminGuidance({ stats }),
    })
  }

  async executeViabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_viability_summary'
    },
  ) {
    this.assertCanManageViability(authContext)

    const payload = viabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_viability_summary': {
        const summary = await this.getWorkspaceViabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return viabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed viability summary with ${summary.stats.viabilityPercent}% billing invoice viability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageViability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production viability tools.',
    })
  }
}
