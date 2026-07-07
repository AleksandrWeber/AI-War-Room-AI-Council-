import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConfigurabilityvaultizabilityRolloutGuidance,
  configurabilityvaultizabilityAdminActionRequestSchema,
  configurabilityvaultizabilityAdminActionResponseSchema,
  configurabilityvaultizabilityAdminSummaryResponseSchema,
  configurabilityvaultizabilityCapabilitiesResponseSchema,
  configurabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConfigurabilityvaultizabilityAdminRecords,
  buildConfigurabilityvaultizabilityAdminStats,
  getConfigurabilityvaultizabilityAdminGuidance,
  resolveConfigurabilityvaultizabilityAdminActions,
} from './configurabilityvaultizability-admin.helpers.js'
import { evaluateConfigurabilityvaultizabilityRollout } from './configurabilityvaultizability-rollout.helpers.js'
import { ConfigurabilityvaultizabilityStatusService } from './configurabilityvaultizability-status.service.js'

@Injectable()
export class ConfigurabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly configurabilityvaultizabilityStatusService: ConfigurabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return configurabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsConfigurabilityvaultizabilityRollout: true,
      supportsConfigurabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceConfigurabilityvaultizabilitySignals: true,
      supportsBillingRecordConfigurabilityvaultizabilitySignals: true,
      guidance: getConfigurabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getConfigurabilityvaultizabilityRollout() {
    const configurabilityvaultizabilityTableCoverage =
      await this.configurabilityvaultizabilityStatusService.getConfigurabilityvaultizabilityTableCoverage()

    const rollout = evaluateConfigurabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.configurabilityvaultizabilityStatusService.pingPostgres(),
      existingConfigurabilityvaultizabilityTableCount: configurabilityvaultizabilityTableCoverage.existingConfigurabilityvaultizabilityTableCount,
      billingInvoicesTableExists: configurabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: configurabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: configurabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return configurabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConfigurabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConfigurabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.configurabilityvaultizabilityStatusService.getWorkspaceConfigurabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildConfigurabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.configurabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildConfigurabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return configurabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConfigurabilityvaultizabilityAdminActions(),
      guidance: getConfigurabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeConfigurabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_configurabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageConfigurabilityvaultizability(authContext)

    const payload = configurabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_configurabilityvaultizability_summary': {
        const summary = await this.getWorkspaceConfigurabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return configurabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed configurabilityvaultizability summary with ${summary.stats.configurabilityvaultizabilityPercent}% billing invoice configurabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConfigurabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production configurabilityvaultizability tools.',
    })
  }
}
