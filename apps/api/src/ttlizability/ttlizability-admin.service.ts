import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTtlizabilityRolloutGuidance,
  ttlizabilityAdminActionRequestSchema,
  ttlizabilityAdminActionResponseSchema,
  ttlizabilityAdminSummaryResponseSchema,
  ttlizabilityCapabilitiesResponseSchema,
  ttlizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTtlizabilityAdminRecords,
  buildTtlizabilityAdminStats,
  getTtlizabilityAdminGuidance,
  resolveTtlizabilityAdminActions,
} from './ttlizability-admin.helpers.js'
import { evaluateTtlizabilityRollout } from './ttlizability-rollout.helpers.js'
import { TtlizabilityStatusService } from './ttlizability-status.service.js'

@Injectable()
export class TtlizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ttlizabilityStatusService: TtlizabilityStatusService,
  ) {}

  getCapabilities() {
    return ttlizabilityCapabilitiesResponseSchema.parse({
      supportsTtlizabilityRollout: true,
      supportsTtlizabilityAdminTools: true,
      supportsBillingInvoiceTtlizabilitySignals: true,
      supportsBillingRecordTtlizabilitySignals: true,
      guidance: getTtlizabilityRolloutGuidance(),
    })
  }

  async getTtlizabilityRollout() {
    const ttlizabilityTableCoverage =
      await this.ttlizabilityStatusService.getTtlizabilityTableCoverage()

    const rollout = evaluateTtlizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.ttlizabilityStatusService.pingPostgres(),
      existingTtlizabilityTableCount: ttlizabilityTableCoverage.existingTtlizabilityTableCount,
      billingInvoicesTableExists: ttlizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: ttlizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: ttlizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return ttlizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTtlizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTtlizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.ttlizabilityStatusService.getWorkspaceTtlizabilityInventory(
        workspaceId,
      )
    const records = buildTtlizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.ttlizabilityStatusService.pingPostgres()
    const stats = buildTtlizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return ttlizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTtlizabilityAdminActions(),
      guidance: getTtlizabilityAdminGuidance({ stats }),
    })
  }

  async executeTtlizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_ttlizability_summary'
    },
  ) {
    this.assertCanManageTtlizability(authContext)

    const payload = ttlizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_ttlizability_summary': {
        const summary = await this.getWorkspaceTtlizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ttlizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed ttlizability summary with ${summary.stats.ttlizabilityPercent}% billing invoice ttlizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTtlizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ttlizability tools.',
    })
  }
}
