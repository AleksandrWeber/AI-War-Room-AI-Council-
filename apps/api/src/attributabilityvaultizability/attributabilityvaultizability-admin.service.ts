import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttributabilityvaultizabilityRolloutGuidance,
  attributabilityvaultizabilityAdminActionRequestSchema,
  attributabilityvaultizabilityAdminActionResponseSchema,
  attributabilityvaultizabilityAdminSummaryResponseSchema,
  attributabilityvaultizabilityCapabilitiesResponseSchema,
  attributabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttributabilityvaultizabilityAdminRecords,
  buildAttributabilityvaultizabilityAdminStats,
  getAttributabilityvaultizabilityAdminGuidance,
  resolveAttributabilityvaultizabilityAdminActions,
} from './attributabilityvaultizability-admin.helpers.js'
import { evaluateAttributabilityvaultizabilityRollout } from './attributabilityvaultizability-rollout.helpers.js'
import { AttributabilityvaultizabilityStatusService } from './attributabilityvaultizability-status.service.js'

@Injectable()
export class AttributabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attributabilityvaultizabilityStatusService: AttributabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return attributabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAttributabilityvaultizabilityRollout: true,
      supportsAttributabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceAttributabilityvaultizabilitySignals: true,
      supportsBillingRecordAttributabilityvaultizabilitySignals: true,
      guidance: getAttributabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getAttributabilityvaultizabilityRollout() {
    const attributabilityvaultizabilityTableCoverage =
      await this.attributabilityvaultizabilityStatusService.getAttributabilityvaultizabilityTableCoverage()

    const rollout = evaluateAttributabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attributabilityvaultizabilityStatusService.pingPostgres(),
      existingAttributabilityvaultizabilityTableCount: attributabilityvaultizabilityTableCoverage.existingAttributabilityvaultizabilityTableCount,
      billingInvoicesTableExists: attributabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: attributabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: attributabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return attributabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttributabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttributabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attributabilityvaultizabilityStatusService.getWorkspaceAttributabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAttributabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attributabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildAttributabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return attributabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttributabilityvaultizabilityAdminActions(),
      guidance: getAttributabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAttributabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attributabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageAttributabilityvaultizability(authContext)

    const payload = attributabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attributabilityvaultizability_summary': {
        const summary = await this.getWorkspaceAttributabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attributabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attributabilityvaultizability summary with ${summary.stats.attributabilityvaultizabilityPercent}% billing invoice attributabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttributabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attributabilityvaultizability tools.',
    })
  }
}
