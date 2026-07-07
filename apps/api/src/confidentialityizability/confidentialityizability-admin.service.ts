import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConfidentialityizabilityRolloutGuidance,
  confidentialityizabilityAdminActionRequestSchema,
  confidentialityizabilityAdminActionResponseSchema,
  confidentialityizabilityAdminSummaryResponseSchema,
  confidentialityizabilityCapabilitiesResponseSchema,
  confidentialityizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConfidentialityizabilityAdminRecords,
  buildConfidentialityizabilityAdminStats,
  getConfidentialityizabilityAdminGuidance,
  resolveConfidentialityizabilityAdminActions,
} from './confidentialityizability-admin.helpers.js'
import { evaluateConfidentialityizabilityRollout } from './confidentialityizability-rollout.helpers.js'
import { ConfidentialityizabilityStatusService } from './confidentialityizability-status.service.js'

@Injectable()
export class ConfidentialityizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly confidentialityizabilityStatusService: ConfidentialityizabilityStatusService,
  ) {}

  getCapabilities() {
    return confidentialityizabilityCapabilitiesResponseSchema.parse({
      supportsConfidentialityizabilityRollout: true,
      supportsConfidentialityizabilityAdminTools: true,
      supportsBillingInvoiceConfidentialityizabilitySignals: true,
      supportsBillingRecordConfidentialityizabilitySignals: true,
      guidance: getConfidentialityizabilityRolloutGuidance(),
    })
  }

  async getConfidentialityizabilityRollout() {
    const confidentialityizabilityTableCoverage =
      await this.confidentialityizabilityStatusService.getConfidentialityizabilityTableCoverage()

    const rollout = evaluateConfidentialityizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.confidentialityizabilityStatusService.pingPostgres(),
      existingConfidentialityizabilityTableCount: confidentialityizabilityTableCoverage.existingConfidentialityizabilityTableCount,
      billingInvoicesTableExists: confidentialityizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: confidentialityizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: confidentialityizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return confidentialityizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConfidentialityizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConfidentialityizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.confidentialityizabilityStatusService.getWorkspaceConfidentialityizabilityInventory(
        workspaceId,
      )
    const records = buildConfidentialityizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.confidentialityizabilityStatusService.pingPostgres()
    const stats = buildConfidentialityizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return confidentialityizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConfidentialityizabilityAdminActions(),
      guidance: getConfidentialityizabilityAdminGuidance({ stats }),
    })
  }

  async executeConfidentialityizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_confidentialityizability_summary'
    },
  ) {
    this.assertCanManageConfidentialityizability(authContext)

    const payload = confidentialityizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_confidentialityizability_summary': {
        const summary = await this.getWorkspaceConfidentialityizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return confidentialityizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed confidentialityizability summary with ${summary.stats.confidentialityizabilityPercent}% billing invoice confidentialityizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConfidentialityizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production confidentialityizability tools.',
    })
  }
}
