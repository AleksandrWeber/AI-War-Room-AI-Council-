import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOrchestrabilityvaultizabilityRolloutGuidance,
  orchestrabilityvaultizabilityAdminActionRequestSchema,
  orchestrabilityvaultizabilityAdminActionResponseSchema,
  orchestrabilityvaultizabilityAdminSummaryResponseSchema,
  orchestrabilityvaultizabilityCapabilitiesResponseSchema,
  orchestrabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOrchestrabilityvaultizabilityAdminRecords,
  buildOrchestrabilityvaultizabilityAdminStats,
  getOrchestrabilityvaultizabilityAdminGuidance,
  resolveOrchestrabilityvaultizabilityAdminActions,
} from './orchestrabilityvaultizability-admin.helpers.js'
import { evaluateOrchestrabilityvaultizabilityRollout } from './orchestrabilityvaultizability-rollout.helpers.js'
import { OrchestrabilityvaultizabilityStatusService } from './orchestrabilityvaultizability-status.service.js'

@Injectable()
export class OrchestrabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly orchestrabilityvaultizabilityStatusService: OrchestrabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return orchestrabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsOrchestrabilityvaultizabilityRollout: true,
      supportsOrchestrabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceOrchestrabilityvaultizabilitySignals: true,
      supportsBillingRecordOrchestrabilityvaultizabilitySignals: true,
      guidance: getOrchestrabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getOrchestrabilityvaultizabilityRollout() {
    const orchestrabilityvaultizabilityTableCoverage =
      await this.orchestrabilityvaultizabilityStatusService.getOrchestrabilityvaultizabilityTableCoverage()

    const rollout = evaluateOrchestrabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.orchestrabilityvaultizabilityStatusService.pingPostgres(),
      existingOrchestrabilityvaultizabilityTableCount: orchestrabilityvaultizabilityTableCoverage.existingOrchestrabilityvaultizabilityTableCount,
      billingInvoicesTableExists: orchestrabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: orchestrabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: orchestrabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return orchestrabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOrchestrabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOrchestrabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.orchestrabilityvaultizabilityStatusService.getWorkspaceOrchestrabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildOrchestrabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.orchestrabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildOrchestrabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return orchestrabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOrchestrabilityvaultizabilityAdminActions(),
      guidance: getOrchestrabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeOrchestrabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_orchestrabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageOrchestrabilityvaultizability(authContext)

    const payload = orchestrabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_orchestrabilityvaultizability_summary': {
        const summary = await this.getWorkspaceOrchestrabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return orchestrabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed orchestrabilityvaultizability summary with ${summary.stats.orchestrabilityvaultizabilityPercent}% billing invoice orchestrabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOrchestrabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production orchestrabilityvaultizability tools.',
    })
  }
}
