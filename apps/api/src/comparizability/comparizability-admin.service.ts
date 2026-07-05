import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComparizabilityRolloutGuidance,
  comparizabilityAdminActionRequestSchema,
  comparizabilityAdminActionResponseSchema,
  comparizabilityAdminSummaryResponseSchema,
  comparizabilityCapabilitiesResponseSchema,
  comparizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComparizabilityAdminRecords,
  buildComparizabilityAdminStats,
  getComparizabilityAdminGuidance,
  resolveComparizabilityAdminActions,
} from './comparizability-admin.helpers.js'
import { evaluateComparizabilityRollout } from './comparizability-rollout.helpers.js'
import { ComparizabilityStatusService } from './comparizability-status.service.js'

@Injectable()
export class ComparizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly comparizabilityStatusService: ComparizabilityStatusService,
  ) {}

  getCapabilities() {
    return comparizabilityCapabilitiesResponseSchema.parse({
      supportsComparizabilityRollout: true,
      supportsComparizabilityAdminTools: true,
      supportsBillingInvoiceComparizabilitySignals: true,
      supportsBillingRecordComparizabilitySignals: true,
      guidance: getComparizabilityRolloutGuidance(),
    })
  }

  async getComparizabilityRollout() {
    const comparizabilityTableCoverage =
      await this.comparizabilityStatusService.getComparizabilityTableCoverage()

    const rollout = evaluateComparizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.comparizabilityStatusService.pingPostgres(),
      existingComparizabilityTableCount: comparizabilityTableCoverage.existingComparizabilityTableCount,
      billingInvoicesTableExists: comparizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: comparizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: comparizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return comparizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComparizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComparizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.comparizabilityStatusService.getWorkspaceComparizabilityInventory(
        workspaceId,
      )
    const records = buildComparizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.comparizabilityStatusService.pingPostgres()
    const stats = buildComparizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return comparizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComparizabilityAdminActions(),
      guidance: getComparizabilityAdminGuidance({ stats }),
    })
  }

  async executeComparizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_comparizability_summary'
    },
  ) {
    this.assertCanManageComparizability(authContext)

    const payload = comparizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_comparizability_summary': {
        const summary = await this.getWorkspaceComparizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return comparizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed comparizability summary with ${summary.stats.comparizabilityPercent}% billing invoice comparizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComparizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production comparizability tools.',
    })
  }
}
