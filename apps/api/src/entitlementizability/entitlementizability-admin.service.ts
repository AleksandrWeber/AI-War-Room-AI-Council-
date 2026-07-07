import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEntitlementizabilityRolloutGuidance,
  entitlementizabilityAdminActionRequestSchema,
  entitlementizabilityAdminActionResponseSchema,
  entitlementizabilityAdminSummaryResponseSchema,
  entitlementizabilityCapabilitiesResponseSchema,
  entitlementizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEntitlementizabilityAdminRecords,
  buildEntitlementizabilityAdminStats,
  getEntitlementizabilityAdminGuidance,
  resolveEntitlementizabilityAdminActions,
} from './entitlementizability-admin.helpers.js'
import { evaluateEntitlementizabilityRollout } from './entitlementizability-rollout.helpers.js'
import { EntitlementizabilityStatusService } from './entitlementizability-status.service.js'

@Injectable()
export class EntitlementizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly entitlementizabilityStatusService: EntitlementizabilityStatusService,
  ) {}

  getCapabilities() {
    return entitlementizabilityCapabilitiesResponseSchema.parse({
      supportsEntitlementizabilityRollout: true,
      supportsEntitlementizabilityAdminTools: true,
      supportsBillingInvoiceEntitlementizabilitySignals: true,
      supportsBillingRecordEntitlementizabilitySignals: true,
      guidance: getEntitlementizabilityRolloutGuidance(),
    })
  }

  async getEntitlementizabilityRollout() {
    const entitlementizabilityTableCoverage =
      await this.entitlementizabilityStatusService.getEntitlementizabilityTableCoverage()

    const rollout = evaluateEntitlementizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.entitlementizabilityStatusService.pingPostgres(),
      existingEntitlementizabilityTableCount: entitlementizabilityTableCoverage.existingEntitlementizabilityTableCount,
      billingInvoicesTableExists: entitlementizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: entitlementizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: entitlementizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return entitlementizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEntitlementizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEntitlementizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.entitlementizabilityStatusService.getWorkspaceEntitlementizabilityInventory(
        workspaceId,
      )
    const records = buildEntitlementizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.entitlementizabilityStatusService.pingPostgres()
    const stats = buildEntitlementizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return entitlementizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEntitlementizabilityAdminActions(),
      guidance: getEntitlementizabilityAdminGuidance({ stats }),
    })
  }

  async executeEntitlementizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_entitlementizability_summary'
    },
  ) {
    this.assertCanManageEntitlementizability(authContext)

    const payload = entitlementizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_entitlementizability_summary': {
        const summary = await this.getWorkspaceEntitlementizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return entitlementizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed entitlementizability summary with ${summary.stats.entitlementizabilityPercent}% billing invoice entitlementizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEntitlementizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production entitlementizability tools.',
    })
  }
}
