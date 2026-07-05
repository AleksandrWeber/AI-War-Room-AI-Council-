import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNegotiabilityRolloutGuidance,
  negotiabilityAdminActionRequestSchema,
  negotiabilityAdminActionResponseSchema,
  negotiabilityAdminSummaryResponseSchema,
  negotiabilityCapabilitiesResponseSchema,
  negotiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNegotiabilityAdminRecords,
  buildNegotiabilityAdminStats,
  getNegotiabilityAdminGuidance,
  resolveNegotiabilityAdminActions,
} from './negotiability-admin.helpers.js'
import { evaluateNegotiabilityRollout } from './negotiability-rollout.helpers.js'
import { NegotiabilityStatusService } from './negotiability-status.service.js'

@Injectable()
export class NegotiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly negotiabilityStatusService: NegotiabilityStatusService,
  ) {}

  getCapabilities() {
    return negotiabilityCapabilitiesResponseSchema.parse({
      supportsNegotiabilityRollout: true,
      supportsNegotiabilityAdminTools: true,
      supportsBillingInvoiceNegotiabilitySignals: true,
      supportsBillingRecordNegotiabilitySignals: true,
      guidance: getNegotiabilityRolloutGuidance(),
    })
  }

  async getNegotiabilityRollout() {
    const negotiabilityTableCoverage =
      await this.negotiabilityStatusService.getNegotiabilityTableCoverage()

    const rollout = evaluateNegotiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.negotiabilityStatusService.pingPostgres(),
      existingNegotiabilityTableCount: negotiabilityTableCoverage.existingNegotiabilityTableCount,
      billingInvoicesTableExists: negotiabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: negotiabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: negotiabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return negotiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNegotiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNegotiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.negotiabilityStatusService.getWorkspaceNegotiabilityInventory(
        workspaceId,
      )
    const records = buildNegotiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.negotiabilityStatusService.pingPostgres()
    const stats = buildNegotiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return negotiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNegotiabilityAdminActions(),
      guidance: getNegotiabilityAdminGuidance({ stats }),
    })
  }

  async executeNegotiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_negotiability_summary'
    },
  ) {
    this.assertCanManageNegotiability(authContext)

    const payload = negotiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_negotiability_summary': {
        const summary = await this.getWorkspaceNegotiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return negotiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed negotiability summary with ${summary.stats.negotiabilityPercent}% billing invoice negotiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNegotiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production negotiability tools.',
    })
  }
}
