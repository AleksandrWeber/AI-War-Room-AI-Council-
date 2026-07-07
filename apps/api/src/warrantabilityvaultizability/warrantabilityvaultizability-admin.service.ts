import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getWarrantabilityvaultizabilityRolloutGuidance,
  warrantabilityvaultizabilityAdminActionRequestSchema,
  warrantabilityvaultizabilityAdminActionResponseSchema,
  warrantabilityvaultizabilityAdminSummaryResponseSchema,
  warrantabilityvaultizabilityCapabilitiesResponseSchema,
  warrantabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildWarrantabilityvaultizabilityAdminRecords,
  buildWarrantabilityvaultizabilityAdminStats,
  getWarrantabilityvaultizabilityAdminGuidance,
  resolveWarrantabilityvaultizabilityAdminActions,
} from './warrantabilityvaultizability-admin.helpers.js'
import { evaluateWarrantabilityvaultizabilityRollout } from './warrantabilityvaultizability-rollout.helpers.js'
import { WarrantabilityvaultizabilityStatusService } from './warrantabilityvaultizability-status.service.js'

@Injectable()
export class WarrantabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly warrantabilityvaultizabilityStatusService: WarrantabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return warrantabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsWarrantabilityvaultizabilityRollout: true,
      supportsWarrantabilityvaultizabilityAdminTools: true,
      supportsBillingNotificationWarrantabilityvaultizabilitySignals: true,
      supportsBillingWebhookWarrantabilityvaultizabilitySignals: true,
      guidance: getWarrantabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getWarrantabilityvaultizabilityRollout() {
    const warrantabilityvaultizabilityTableCoverage =
      await this.warrantabilityvaultizabilityStatusService.getWarrantabilityvaultizabilityTableCoverage()

    const rollout = evaluateWarrantabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.warrantabilityvaultizabilityStatusService.pingPostgres(),
      existingWarrantabilityvaultizabilityTableCount: warrantabilityvaultizabilityTableCoverage.existingWarrantabilityvaultizabilityTableCount,
      billingNotificationsTableExists: warrantabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: warrantabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: warrantabilityvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return warrantabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceWarrantabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageWarrantabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.warrantabilityvaultizabilityStatusService.getWorkspaceWarrantabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildWarrantabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.warrantabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildWarrantabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return warrantabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveWarrantabilityvaultizabilityAdminActions(),
      guidance: getWarrantabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeWarrantabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_warrantabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageWarrantabilityvaultizability(authContext)

    const payload = warrantabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_warrantabilityvaultizability_summary': {
        const summary = await this.getWorkspaceWarrantabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return warrantabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed warrantabilityvaultizability summary with ${summary.stats.warrantabilityvaultizabilityPercent}% billing notification warrantabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageWarrantabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production warrantabilityvaultizability tools.',
    })
  }
}
