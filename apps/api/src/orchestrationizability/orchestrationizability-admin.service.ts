import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOrchestrationizabilityRolloutGuidance,
  orchestrationizabilityAdminActionRequestSchema,
  orchestrationizabilityAdminActionResponseSchema,
  orchestrationizabilityAdminSummaryResponseSchema,
  orchestrationizabilityCapabilitiesResponseSchema,
  orchestrationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOrchestrationizabilityAdminRecords,
  buildOrchestrationizabilityAdminStats,
  getOrchestrationizabilityAdminGuidance,
  resolveOrchestrationizabilityAdminActions,
} from './orchestrationizability-admin.helpers.js'
import { evaluateOrchestrationizabilityRollout } from './orchestrationizability-rollout.helpers.js'
import { OrchestrationizabilityStatusService } from './orchestrationizability-status.service.js'

@Injectable()
export class OrchestrationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly orchestrationizabilityStatusService: OrchestrationizabilityStatusService,
  ) {}

  getCapabilities() {
    return orchestrationizabilityCapabilitiesResponseSchema.parse({
      supportsOrchestrationizabilityRollout: true,
      supportsOrchestrationizabilityAdminTools: true,
      supportsBillingWebhookOrchestrationizabilitySignals: true,
      supportsBillingRecordOrchestrationizabilitySignals: true,
      guidance: getOrchestrationizabilityRolloutGuidance(),
    })
  }

  async getOrchestrationizabilityRollout() {
    const orchestrationizabilityTableCoverage =
      await this.orchestrationizabilityStatusService.getOrchestrationizabilityTableCoverage()

    const rollout = evaluateOrchestrationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.orchestrationizabilityStatusService.pingPostgres(),
      existingOrchestrationizabilityTableCount: orchestrationizabilityTableCoverage.existingOrchestrationizabilityTableCount,
      billingWebhookEventsTableExists: orchestrationizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: orchestrationizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: orchestrationizabilityTableCoverage.usageEventsTableExists,
    })

    return orchestrationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOrchestrationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOrchestrationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.orchestrationizabilityStatusService.getWorkspaceOrchestrationizabilityInventory(
        workspaceId,
      )
    const records = buildOrchestrationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.orchestrationizabilityStatusService.pingPostgres()
    const stats = buildOrchestrationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return orchestrationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOrchestrationizabilityAdminActions(),
      guidance: getOrchestrationizabilityAdminGuidance({ stats }),
    })
  }

  async executeOrchestrationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_orchestrationizability_summary'
    },
  ) {
    this.assertCanManageOrchestrationizability(authContext)

    const payload = orchestrationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_orchestrationizability_summary': {
        const summary = await this.getWorkspaceOrchestrationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return orchestrationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed orchestrationizability summary with ${summary.stats.orchestrationizabilityPercent}% billing webhook orchestrationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOrchestrationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production orchestrationizability tools.',
    })
  }
}
