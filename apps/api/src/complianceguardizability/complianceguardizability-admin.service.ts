import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComplianceguardizabilityRolloutGuidance,
  complianceguardizabilityAdminActionRequestSchema,
  complianceguardizabilityAdminActionResponseSchema,
  complianceguardizabilityAdminSummaryResponseSchema,
  complianceguardizabilityCapabilitiesResponseSchema,
  complianceguardizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComplianceguardizabilityAdminRecords,
  buildComplianceguardizabilityAdminStats,
  getComplianceguardizabilityAdminGuidance,
  resolveComplianceguardizabilityAdminActions,
} from './complianceguardizability-admin.helpers.js'
import { evaluateComplianceguardizabilityRollout } from './complianceguardizability-rollout.helpers.js'
import { ComplianceguardizabilityStatusService } from './complianceguardizability-status.service.js'

@Injectable()
export class ComplianceguardizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly complianceguardizabilityStatusService: ComplianceguardizabilityStatusService,
  ) {}

  getCapabilities() {
    return complianceguardizabilityCapabilitiesResponseSchema.parse({
      supportsComplianceguardizabilityRollout: true,
      supportsComplianceguardizabilityAdminTools: true,
      supportsBillingNotificationComplianceguardizabilitySignals: true,
      supportsBillingWebhookComplianceguardizabilitySignals: true,
      guidance: getComplianceguardizabilityRolloutGuidance(),
    })
  }

  async getComplianceguardizabilityRollout() {
    const complianceguardizabilityTableCoverage =
      await this.complianceguardizabilityStatusService.getComplianceguardizabilityTableCoverage()

    const rollout = evaluateComplianceguardizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.complianceguardizabilityStatusService.pingPostgres(),
      existingComplianceguardizabilityTableCount: complianceguardizabilityTableCoverage.existingComplianceguardizabilityTableCount,
      billingNotificationsTableExists: complianceguardizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: complianceguardizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: complianceguardizabilityTableCoverage.usageEventsTableExists,
    })

    return complianceguardizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComplianceguardizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComplianceguardizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.complianceguardizabilityStatusService.getWorkspaceComplianceguardizabilityInventory(
        workspaceId,
      )
    const records = buildComplianceguardizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.complianceguardizabilityStatusService.pingPostgres()
    const stats = buildComplianceguardizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return complianceguardizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComplianceguardizabilityAdminActions(),
      guidance: getComplianceguardizabilityAdminGuidance({ stats }),
    })
  }

  async executeComplianceguardizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_complianceguardizability_summary'
    },
  ) {
    this.assertCanManageComplianceguardizability(authContext)

    const payload = complianceguardizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_complianceguardizability_summary': {
        const summary = await this.getWorkspaceComplianceguardizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return complianceguardizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed complianceguardizability summary with ${summary.stats.complianceguardizabilityPercent}% billing notification complianceguardizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComplianceguardizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production complianceguardizability tools.',
    })
  }
}
