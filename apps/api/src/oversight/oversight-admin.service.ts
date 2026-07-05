import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOversightRolloutGuidance,
  oversightAdminActionRequestSchema,
  oversightAdminActionResponseSchema,
  oversightAdminSummaryResponseSchema,
  oversightCapabilitiesResponseSchema,
  oversightRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOversightAdminRecords,
  buildOversightAdminStats,
  getOversightAdminGuidance,
  resolveOversightAdminActions,
} from './oversight-admin.helpers.js'
import { evaluateOversightRollout } from './oversight-rollout.helpers.js'
import { OversightStatusService } from './oversight-status.service.js'

@Injectable()
export class OversightAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly oversightStatusService: OversightStatusService,
  ) {}

  getCapabilities() {
    return oversightCapabilitiesResponseSchema.parse({
      supportsOversightRollout: true,
      supportsOversightAdminTools: true,
      supportsBillingOversightSignals: true,
      supportsUsageOversightSignals: true,
      guidance: getOversightRolloutGuidance(),
    })
  }

  async getOversightRollout() {
    const oversightTableCoverage =
      await this.oversightStatusService.getOversightTableCoverage()

    const rollout = evaluateOversightRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.oversightStatusService.pingPostgres(),
      existingOversightTableCount:
        oversightTableCoverage.existingOversightTableCount,
      billingInvoicesTableExists:
        oversightTableCoverage.billingInvoicesTableExists,
      billingWebhookEventsTableExists:
        oversightTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: oversightTableCoverage.usageEventsTableExists,
    })

    return oversightRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOversightAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOversight(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.oversightStatusService.getWorkspaceOversightInventory(
        workspaceId,
      )
    const records = buildOversightAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.oversightStatusService.pingPostgres()
    const stats = buildOversightAdminStats({
      records,
      postgresConnectivity,
    })

    return oversightAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOversightAdminActions(),
      guidance: getOversightAdminGuidance({ stats }),
    })
  }

  async executeOversightAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_oversight_summary'
    },
  ) {
    this.assertCanManageOversight(authContext)

    const payload = oversightAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_oversight_summary': {
        const summary = await this.getWorkspaceOversightAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return oversightAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed oversight summary with ${summary.stats.oversightPercent}% billing oversight across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOversight(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production oversight tools.',
    })
  }
}
