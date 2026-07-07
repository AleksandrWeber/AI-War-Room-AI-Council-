import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDefensibilityvaultizabilityRolloutGuidance,
  defensibilityvaultizabilityAdminActionRequestSchema,
  defensibilityvaultizabilityAdminActionResponseSchema,
  defensibilityvaultizabilityAdminSummaryResponseSchema,
  defensibilityvaultizabilityCapabilitiesResponseSchema,
  defensibilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDefensibilityvaultizabilityAdminRecords,
  buildDefensibilityvaultizabilityAdminStats,
  getDefensibilityvaultizabilityAdminGuidance,
  resolveDefensibilityvaultizabilityAdminActions,
} from './defensibilityvaultizability-admin.helpers.js'
import { evaluateDefensibilityvaultizabilityRollout } from './defensibilityvaultizability-rollout.helpers.js'
import { DefensibilityvaultizabilityStatusService } from './defensibilityvaultizability-status.service.js'

@Injectable()
export class DefensibilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly defensibilityvaultizabilityStatusService: DefensibilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return defensibilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsDefensibilityvaultizabilityRollout: true,
      supportsDefensibilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceDefensibilityvaultizabilitySignals: true,
      supportsBillingRecordDefensibilityvaultizabilitySignals: true,
      guidance: getDefensibilityvaultizabilityRolloutGuidance(),
    })
  }

  async getDefensibilityvaultizabilityRollout() {
    const defensibilityvaultizabilityTableCoverage =
      await this.defensibilityvaultizabilityStatusService.getDefensibilityvaultizabilityTableCoverage()

    const rollout = evaluateDefensibilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.defensibilityvaultizabilityStatusService.pingPostgres(),
      existingDefensibilityvaultizabilityTableCount: defensibilityvaultizabilityTableCoverage.existingDefensibilityvaultizabilityTableCount,
      billingInvoicesTableExists: defensibilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: defensibilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: defensibilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return defensibilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDefensibilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDefensibilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.defensibilityvaultizabilityStatusService.getWorkspaceDefensibilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildDefensibilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.defensibilityvaultizabilityStatusService.pingPostgres()
    const stats = buildDefensibilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return defensibilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDefensibilityvaultizabilityAdminActions(),
      guidance: getDefensibilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeDefensibilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_defensibilityvaultizability_summary'
    },
  ) {
    this.assertCanManageDefensibilityvaultizability(authContext)

    const payload = defensibilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_defensibilityvaultizability_summary': {
        const summary = await this.getWorkspaceDefensibilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return defensibilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed defensibilityvaultizability summary with ${summary.stats.defensibilityvaultizabilityPercent}% billing invoice defensibilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDefensibilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production defensibilityvaultizability tools.',
    })
  }
}
