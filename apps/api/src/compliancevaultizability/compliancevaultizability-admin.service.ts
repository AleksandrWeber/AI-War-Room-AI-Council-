import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompliancevaultizabilityRolloutGuidance,
  compliancevaultizabilityAdminActionRequestSchema,
  compliancevaultizabilityAdminActionResponseSchema,
  compliancevaultizabilityAdminSummaryResponseSchema,
  compliancevaultizabilityCapabilitiesResponseSchema,
  compliancevaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompliancevaultizabilityAdminRecords,
  buildCompliancevaultizabilityAdminStats,
  getCompliancevaultizabilityAdminGuidance,
  resolveCompliancevaultizabilityAdminActions,
} from './compliancevaultizability-admin.helpers.js'
import { evaluateCompliancevaultizabilityRollout } from './compliancevaultizability-rollout.helpers.js'
import { CompliancevaultizabilityStatusService } from './compliancevaultizability-status.service.js'

@Injectable()
export class CompliancevaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compliancevaultizabilityStatusService: CompliancevaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return compliancevaultizabilityCapabilitiesResponseSchema.parse({
      supportsCompliancevaultizabilityRollout: true,
      supportsCompliancevaultizabilityAdminTools: true,
      supportsBillingNotificationCompliancevaultizabilitySignals: true,
      supportsBillingWebhookCompliancevaultizabilitySignals: true,
      guidance: getCompliancevaultizabilityRolloutGuidance(),
    })
  }

  async getCompliancevaultizabilityRollout() {
    const compliancevaultizabilityTableCoverage =
      await this.compliancevaultizabilityStatusService.getCompliancevaultizabilityTableCoverage()

    const rollout = evaluateCompliancevaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compliancevaultizabilityStatusService.pingPostgres(),
      existingCompliancevaultizabilityTableCount: compliancevaultizabilityTableCoverage.existingCompliancevaultizabilityTableCount,
      billingNotificationsTableExists: compliancevaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: compliancevaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: compliancevaultizabilityTableCoverage.usageEventsTableExists,
    })

    return compliancevaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompliancevaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompliancevaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compliancevaultizabilityStatusService.getWorkspaceCompliancevaultizabilityInventory(
        workspaceId,
      )
    const records = buildCompliancevaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compliancevaultizabilityStatusService.pingPostgres()
    const stats = buildCompliancevaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compliancevaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompliancevaultizabilityAdminActions(),
      guidance: getCompliancevaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompliancevaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compliancevaultizability_summary'
    },
  ) {
    this.assertCanManageCompliancevaultizability(authContext)

    const payload = compliancevaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compliancevaultizability_summary': {
        const summary = await this.getWorkspaceCompliancevaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compliancevaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compliancevaultizability summary with ${summary.stats.compliancevaultizabilityPercent}% billing notification compliancevaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompliancevaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compliancevaultizability tools.',
    })
  }
}
