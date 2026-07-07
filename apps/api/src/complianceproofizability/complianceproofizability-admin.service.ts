import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComplianceproofizabilityRolloutGuidance,
  complianceproofizabilityAdminActionRequestSchema,
  complianceproofizabilityAdminActionResponseSchema,
  complianceproofizabilityAdminSummaryResponseSchema,
  complianceproofizabilityCapabilitiesResponseSchema,
  complianceproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComplianceproofizabilityAdminRecords,
  buildComplianceproofizabilityAdminStats,
  getComplianceproofizabilityAdminGuidance,
  resolveComplianceproofizabilityAdminActions,
} from './complianceproofizability-admin.helpers.js'
import { evaluateComplianceproofizabilityRollout } from './complianceproofizability-rollout.helpers.js'
import { ComplianceproofizabilityStatusService } from './complianceproofizability-status.service.js'

@Injectable()
export class ComplianceproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly complianceproofizabilityStatusService: ComplianceproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return complianceproofizabilityCapabilitiesResponseSchema.parse({
      supportsComplianceproofizabilityRollout: true,
      supportsComplianceproofizabilityAdminTools: true,
      supportsBillingNotificationComplianceproofizabilitySignals: true,
      supportsBillingWebhookComplianceproofizabilitySignals: true,
      guidance: getComplianceproofizabilityRolloutGuidance(),
    })
  }

  async getComplianceproofizabilityRollout() {
    const complianceproofizabilityTableCoverage =
      await this.complianceproofizabilityStatusService.getComplianceproofizabilityTableCoverage()

    const rollout = evaluateComplianceproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.complianceproofizabilityStatusService.pingPostgres(),
      existingComplianceproofizabilityTableCount: complianceproofizabilityTableCoverage.existingComplianceproofizabilityTableCount,
      billingNotificationsTableExists: complianceproofizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: complianceproofizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: complianceproofizabilityTableCoverage.usageEventsTableExists,
    })

    return complianceproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComplianceproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComplianceproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.complianceproofizabilityStatusService.getWorkspaceComplianceproofizabilityInventory(
        workspaceId,
      )
    const records = buildComplianceproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.complianceproofizabilityStatusService.pingPostgres()
    const stats = buildComplianceproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return complianceproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComplianceproofizabilityAdminActions(),
      guidance: getComplianceproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeComplianceproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_complianceproofizability_summary'
    },
  ) {
    this.assertCanManageComplianceproofizability(authContext)

    const payload = complianceproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_complianceproofizability_summary': {
        const summary = await this.getWorkspaceComplianceproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return complianceproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed complianceproofizability summary with ${summary.stats.complianceproofizabilityPercent}% billing notification complianceproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComplianceproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production complianceproofizability tools.',
    })
  }
}
