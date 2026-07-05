import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAppendizabilityRolloutGuidance,
  appendizabilityAdminActionRequestSchema,
  appendizabilityAdminActionResponseSchema,
  appendizabilityAdminSummaryResponseSchema,
  appendizabilityCapabilitiesResponseSchema,
  appendizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAppendizabilityAdminRecords,
  buildAppendizabilityAdminStats,
  getAppendizabilityAdminGuidance,
  resolveAppendizabilityAdminActions,
} from './appendizability-admin.helpers.js'
import { evaluateAppendizabilityRollout } from './appendizability-rollout.helpers.js'
import { AppendizabilityStatusService } from './appendizability-status.service.js'

@Injectable()
export class AppendizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly appendizabilityStatusService: AppendizabilityStatusService,
  ) {}

  getCapabilities() {
    return appendizabilityCapabilitiesResponseSchema.parse({
      supportsAppendizabilityRollout: true,
      supportsAppendizabilityAdminTools: true,
      supportsBillingInvoiceAppendizabilitySignals: true,
      supportsBillingRecordAppendizabilitySignals: true,
      guidance: getAppendizabilityRolloutGuidance(),
    })
  }

  async getAppendizabilityRollout() {
    const appendizabilityTableCoverage =
      await this.appendizabilityStatusService.getAppendizabilityTableCoverage()

    const rollout = evaluateAppendizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.appendizabilityStatusService.pingPostgres(),
      existingAppendizabilityTableCount: appendizabilityTableCoverage.existingAppendizabilityTableCount,
      billingInvoicesTableExists: appendizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: appendizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: appendizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return appendizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAppendizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAppendizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.appendizabilityStatusService.getWorkspaceAppendizabilityInventory(
        workspaceId,
      )
    const records = buildAppendizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.appendizabilityStatusService.pingPostgres()
    const stats = buildAppendizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return appendizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAppendizabilityAdminActions(),
      guidance: getAppendizabilityAdminGuidance({ stats }),
    })
  }

  async executeAppendizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_appendizability_summary'
    },
  ) {
    this.assertCanManageAppendizability(authContext)

    const payload = appendizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_appendizability_summary': {
        const summary = await this.getWorkspaceAppendizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return appendizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed appendizability summary with ${summary.stats.appendizabilityPercent}% billing invoice appendizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAppendizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production appendizability tools.',
    })
  }
}
