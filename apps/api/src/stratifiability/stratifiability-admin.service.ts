import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getStratifiabilityRolloutGuidance,
  stratifiabilityAdminActionRequestSchema,
  stratifiabilityAdminActionResponseSchema,
  stratifiabilityAdminSummaryResponseSchema,
  stratifiabilityCapabilitiesResponseSchema,
  stratifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildStratifiabilityAdminRecords,
  buildStratifiabilityAdminStats,
  getStratifiabilityAdminGuidance,
  resolveStratifiabilityAdminActions,
} from './stratifiability-admin.helpers.js'
import { evaluateStratifiabilityRollout } from './stratifiability-rollout.helpers.js'
import { StratifiabilityStatusService } from './stratifiability-status.service.js'

@Injectable()
export class StratifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly stratifiabilityStatusService: StratifiabilityStatusService,
  ) {}

  getCapabilities() {
    return stratifiabilityCapabilitiesResponseSchema.parse({
      supportsStratifiabilityRollout: true,
      supportsStratifiabilityAdminTools: true,
      supportsBillingInvoiceStratifiabilitySignals: true,
      supportsBillingRecordStratifiabilitySignals: true,
      guidance: getStratifiabilityRolloutGuidance(),
    })
  }

  async getStratifiabilityRollout() {
    const stratifiabilityTableCoverage =
      await this.stratifiabilityStatusService.getStratifiabilityTableCoverage()

    const rollout = evaluateStratifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.stratifiabilityStatusService.pingPostgres(),
      existingStratifiabilityTableCount: stratifiabilityTableCoverage.existingStratifiabilityTableCount,
      billingInvoicesTableExists: stratifiabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: stratifiabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: stratifiabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return stratifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStratifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStratifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.stratifiabilityStatusService.getWorkspaceStratifiabilityInventory(
        workspaceId,
      )
    const records = buildStratifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.stratifiabilityStatusService.pingPostgres()
    const stats = buildStratifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return stratifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveStratifiabilityAdminActions(),
      guidance: getStratifiabilityAdminGuidance({ stats }),
    })
  }

  async executeStratifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_stratifiability_summary'
    },
  ) {
    this.assertCanManageStratifiability(authContext)

    const payload = stratifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_stratifiability_summary': {
        const summary = await this.getWorkspaceStratifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return stratifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed stratifiability summary with ${summary.stats.stratifiabilityPercent}% billing invoice stratifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStratifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production stratifiability tools.',
    })
  }
}
