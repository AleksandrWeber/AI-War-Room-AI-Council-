import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExpandizabilityRolloutGuidance,
  expandizabilityAdminActionRequestSchema,
  expandizabilityAdminActionResponseSchema,
  expandizabilityAdminSummaryResponseSchema,
  expandizabilityCapabilitiesResponseSchema,
  expandizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExpandizabilityAdminRecords,
  buildExpandizabilityAdminStats,
  getExpandizabilityAdminGuidance,
  resolveExpandizabilityAdminActions,
} from './expandizability-admin.helpers.js'
import { evaluateExpandizabilityRollout } from './expandizability-rollout.helpers.js'
import { ExpandizabilityStatusService } from './expandizability-status.service.js'

@Injectable()
export class ExpandizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly expandizabilityStatusService: ExpandizabilityStatusService,
  ) {}

  getCapabilities() {
    return expandizabilityCapabilitiesResponseSchema.parse({
      supportsExpandizabilityRollout: true,
      supportsExpandizabilityAdminTools: true,
      supportsBillingInvoiceExpandizabilitySignals: true,
      supportsBillingRecordExpandizabilitySignals: true,
      guidance: getExpandizabilityRolloutGuidance(),
    })
  }

  async getExpandizabilityRollout() {
    const expandizabilityTableCoverage =
      await this.expandizabilityStatusService.getExpandizabilityTableCoverage()

    const rollout = evaluateExpandizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.expandizabilityStatusService.pingPostgres(),
      existingExpandizabilityTableCount: expandizabilityTableCoverage.existingExpandizabilityTableCount,
      billingInvoicesTableExists: expandizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: expandizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: expandizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return expandizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExpandizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExpandizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.expandizabilityStatusService.getWorkspaceExpandizabilityInventory(
        workspaceId,
      )
    const records = buildExpandizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.expandizabilityStatusService.pingPostgres()
    const stats = buildExpandizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return expandizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExpandizabilityAdminActions(),
      guidance: getExpandizabilityAdminGuidance({ stats }),
    })
  }

  async executeExpandizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_expandizability_summary'
    },
  ) {
    this.assertCanManageExpandizability(authContext)

    const payload = expandizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_expandizability_summary': {
        const summary = await this.getWorkspaceExpandizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return expandizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed expandizability summary with ${summary.stats.expandizabilityPercent}% billing invoice expandizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExpandizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production expandizability tools.',
    })
  }
}
