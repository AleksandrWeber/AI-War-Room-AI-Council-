import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRepeatabilityvaultizabilityRolloutGuidance,
  repeatabilityvaultizabilityAdminActionRequestSchema,
  repeatabilityvaultizabilityAdminActionResponseSchema,
  repeatabilityvaultizabilityAdminSummaryResponseSchema,
  repeatabilityvaultizabilityCapabilitiesResponseSchema,
  repeatabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRepeatabilityvaultizabilityAdminRecords,
  buildRepeatabilityvaultizabilityAdminStats,
  getRepeatabilityvaultizabilityAdminGuidance,
  resolveRepeatabilityvaultizabilityAdminActions,
} from './repeatabilityvaultizability-admin.helpers.js'
import { evaluateRepeatabilityvaultizabilityRollout } from './repeatabilityvaultizability-rollout.helpers.js'
import { RepeatabilityvaultizabilityStatusService } from './repeatabilityvaultizability-status.service.js'

@Injectable()
export class RepeatabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly repeatabilityvaultizabilityStatusService: RepeatabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return repeatabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsRepeatabilityvaultizabilityRollout: true,
      supportsRepeatabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceRepeatabilityvaultizabilitySignals: true,
      supportsBillingRecordRepeatabilityvaultizabilitySignals: true,
      guidance: getRepeatabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getRepeatabilityvaultizabilityRollout() {
    const repeatabilityvaultizabilityTableCoverage =
      await this.repeatabilityvaultizabilityStatusService.getRepeatabilityvaultizabilityTableCoverage()

    const rollout = evaluateRepeatabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.repeatabilityvaultizabilityStatusService.pingPostgres(),
      existingRepeatabilityvaultizabilityTableCount: repeatabilityvaultizabilityTableCoverage.existingRepeatabilityvaultizabilityTableCount,
      billingInvoicesTableExists: repeatabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: repeatabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: repeatabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return repeatabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRepeatabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRepeatabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.repeatabilityvaultizabilityStatusService.getWorkspaceRepeatabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildRepeatabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.repeatabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildRepeatabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return repeatabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRepeatabilityvaultizabilityAdminActions(),
      guidance: getRepeatabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeRepeatabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_repeatabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageRepeatabilityvaultizability(authContext)

    const payload = repeatabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_repeatabilityvaultizability_summary': {
        const summary = await this.getWorkspaceRepeatabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return repeatabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed repeatabilityvaultizability summary with ${summary.stats.repeatabilityvaultizabilityPercent}% billing invoice repeatabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRepeatabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production repeatabilityvaultizability tools.',
    })
  }
}
