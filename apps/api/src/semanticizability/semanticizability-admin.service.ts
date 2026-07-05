import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSemanticizabilityRolloutGuidance,
  semanticizabilityAdminActionRequestSchema,
  semanticizabilityAdminActionResponseSchema,
  semanticizabilityAdminSummaryResponseSchema,
  semanticizabilityCapabilitiesResponseSchema,
  semanticizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSemanticizabilityAdminRecords,
  buildSemanticizabilityAdminStats,
  getSemanticizabilityAdminGuidance,
  resolveSemanticizabilityAdminActions,
} from './semanticizability-admin.helpers.js'
import { evaluateSemanticizabilityRollout } from './semanticizability-rollout.helpers.js'
import { SemanticizabilityStatusService } from './semanticizability-status.service.js'

@Injectable()
export class SemanticizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly semanticizabilityStatusService: SemanticizabilityStatusService,
  ) {}

  getCapabilities() {
    return semanticizabilityCapabilitiesResponseSchema.parse({
      supportsSemanticizabilityRollout: true,
      supportsSemanticizabilityAdminTools: true,
      supportsBillingInvoiceSemanticizabilitySignals: true,
      supportsBillingRecordSemanticizabilitySignals: true,
      guidance: getSemanticizabilityRolloutGuidance(),
    })
  }

  async getSemanticizabilityRollout() {
    const semanticizabilityTableCoverage =
      await this.semanticizabilityStatusService.getSemanticizabilityTableCoverage()

    const rollout = evaluateSemanticizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.semanticizabilityStatusService.pingPostgres(),
      existingSemanticizabilityTableCount: semanticizabilityTableCoverage.existingSemanticizabilityTableCount,
      billingInvoicesTableExists: semanticizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: semanticizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: semanticizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return semanticizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSemanticizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSemanticizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.semanticizabilityStatusService.getWorkspaceSemanticizabilityInventory(
        workspaceId,
      )
    const records = buildSemanticizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.semanticizabilityStatusService.pingPostgres()
    const stats = buildSemanticizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return semanticizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSemanticizabilityAdminActions(),
      guidance: getSemanticizabilityAdminGuidance({ stats }),
    })
  }

  async executeSemanticizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_semanticizability_summary'
    },
  ) {
    this.assertCanManageSemanticizability(authContext)

    const payload = semanticizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_semanticizability_summary': {
        const summary = await this.getWorkspaceSemanticizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return semanticizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed semanticizability summary with ${summary.stats.semanticizabilityPercent}% billing invoice semanticizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSemanticizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production semanticizability tools.',
    })
  }
}
