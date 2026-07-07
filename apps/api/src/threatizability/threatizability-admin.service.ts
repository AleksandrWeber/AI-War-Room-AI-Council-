import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getThreatizabilityRolloutGuidance,
  threatizabilityAdminActionRequestSchema,
  threatizabilityAdminActionResponseSchema,
  threatizabilityAdminSummaryResponseSchema,
  threatizabilityCapabilitiesResponseSchema,
  threatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildThreatizabilityAdminRecords,
  buildThreatizabilityAdminStats,
  getThreatizabilityAdminGuidance,
  resolveThreatizabilityAdminActions,
} from './threatizability-admin.helpers.js'
import { evaluateThreatizabilityRollout } from './threatizability-rollout.helpers.js'
import { ThreatizabilityStatusService } from './threatizability-status.service.js'

@Injectable()
export class ThreatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly threatizabilityStatusService: ThreatizabilityStatusService,
  ) {}

  getCapabilities() {
    return threatizabilityCapabilitiesResponseSchema.parse({
      supportsThreatizabilityRollout: true,
      supportsThreatizabilityAdminTools: true,
      supportsBillingInvoiceThreatizabilitySignals: true,
      supportsBillingRecordThreatizabilitySignals: true,
      guidance: getThreatizabilityRolloutGuidance(),
    })
  }

  async getThreatizabilityRollout() {
    const threatizabilityTableCoverage =
      await this.threatizabilityStatusService.getThreatizabilityTableCoverage()

    const rollout = evaluateThreatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.threatizabilityStatusService.pingPostgres(),
      existingThreatizabilityTableCount: threatizabilityTableCoverage.existingThreatizabilityTableCount,
      billingInvoicesTableExists: threatizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: threatizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: threatizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return threatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceThreatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageThreatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.threatizabilityStatusService.getWorkspaceThreatizabilityInventory(
        workspaceId,
      )
    const records = buildThreatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.threatizabilityStatusService.pingPostgres()
    const stats = buildThreatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return threatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveThreatizabilityAdminActions(),
      guidance: getThreatizabilityAdminGuidance({ stats }),
    })
  }

  async executeThreatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_threatizability_summary'
    },
  ) {
    this.assertCanManageThreatizability(authContext)

    const payload = threatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_threatizability_summary': {
        const summary = await this.getWorkspaceThreatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return threatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed threatizability summary with ${summary.stats.threatizabilityPercent}% billing invoice threatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageThreatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production threatizability tools.',
    })
  }
}
