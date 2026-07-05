import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSchedulizabilityRolloutGuidance,
  schedulizabilityAdminActionRequestSchema,
  schedulizabilityAdminActionResponseSchema,
  schedulizabilityAdminSummaryResponseSchema,
  schedulizabilityCapabilitiesResponseSchema,
  schedulizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSchedulizabilityAdminRecords,
  buildSchedulizabilityAdminStats,
  getSchedulizabilityAdminGuidance,
  resolveSchedulizabilityAdminActions,
} from './schedulizability-admin.helpers.js'
import { evaluateSchedulizabilityRollout } from './schedulizability-rollout.helpers.js'
import { SchedulizabilityStatusService } from './schedulizability-status.service.js'

@Injectable()
export class SchedulizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly schedulizabilityStatusService: SchedulizabilityStatusService,
  ) {}

  getCapabilities() {
    return schedulizabilityCapabilitiesResponseSchema.parse({
      supportsSchedulizabilityRollout: true,
      supportsSchedulizabilityAdminTools: true,
      supportsBillingInvoiceSchedulizabilitySignals: true,
      supportsBillingRecordSchedulizabilitySignals: true,
      guidance: getSchedulizabilityRolloutGuidance(),
    })
  }

  async getSchedulizabilityRollout() {
    const schedulizabilityTableCoverage =
      await this.schedulizabilityStatusService.getSchedulizabilityTableCoverage()

    const rollout = evaluateSchedulizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.schedulizabilityStatusService.pingPostgres(),
      existingSchedulizabilityTableCount: schedulizabilityTableCoverage.existingSchedulizabilityTableCount,
      billingInvoicesTableExists: schedulizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: schedulizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: schedulizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return schedulizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSchedulizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSchedulizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.schedulizabilityStatusService.getWorkspaceSchedulizabilityInventory(
        workspaceId,
      )
    const records = buildSchedulizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.schedulizabilityStatusService.pingPostgres()
    const stats = buildSchedulizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return schedulizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSchedulizabilityAdminActions(),
      guidance: getSchedulizabilityAdminGuidance({ stats }),
    })
  }

  async executeSchedulizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_schedulizability_summary'
    },
  ) {
    this.assertCanManageSchedulizability(authContext)

    const payload = schedulizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_schedulizability_summary': {
        const summary = await this.getWorkspaceSchedulizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return schedulizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed schedulizability summary with ${summary.stats.schedulizabilityPercent}% billing invoice schedulizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSchedulizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production schedulizability tools.',
    })
  }
}
