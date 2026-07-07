import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getConnectabilityvaultizabilityRolloutGuidance,
  connectabilityvaultizabilityAdminActionRequestSchema,
  connectabilityvaultizabilityAdminActionResponseSchema,
  connectabilityvaultizabilityAdminSummaryResponseSchema,
  connectabilityvaultizabilityCapabilitiesResponseSchema,
  connectabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildConnectabilityvaultizabilityAdminRecords,
  buildConnectabilityvaultizabilityAdminStats,
  getConnectabilityvaultizabilityAdminGuidance,
  resolveConnectabilityvaultizabilityAdminActions,
} from './connectabilityvaultizability-admin.helpers.js'
import { evaluateConnectabilityvaultizabilityRollout } from './connectabilityvaultizability-rollout.helpers.js'
import { ConnectabilityvaultizabilityStatusService } from './connectabilityvaultizability-status.service.js'

@Injectable()
export class ConnectabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly connectabilityvaultizabilityStatusService: ConnectabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return connectabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsConnectabilityvaultizabilityRollout: true,
      supportsConnectabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceConnectabilityvaultizabilitySignals: true,
      supportsBillingRecordConnectabilityvaultizabilitySignals: true,
      guidance: getConnectabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getConnectabilityvaultizabilityRollout() {
    const connectabilityvaultizabilityTableCoverage =
      await this.connectabilityvaultizabilityStatusService.getConnectabilityvaultizabilityTableCoverage()

    const rollout = evaluateConnectabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.connectabilityvaultizabilityStatusService.pingPostgres(),
      existingConnectabilityvaultizabilityTableCount: connectabilityvaultizabilityTableCoverage.existingConnectabilityvaultizabilityTableCount,
      billingInvoicesTableExists: connectabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: connectabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: connectabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return connectabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceConnectabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageConnectabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.connectabilityvaultizabilityStatusService.getWorkspaceConnectabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildConnectabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.connectabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildConnectabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return connectabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveConnectabilityvaultizabilityAdminActions(),
      guidance: getConnectabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeConnectabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_connectabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageConnectabilityvaultizability(authContext)

    const payload = connectabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_connectabilityvaultizability_summary': {
        const summary = await this.getWorkspaceConnectabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return connectabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed connectabilityvaultizability summary with ${summary.stats.connectabilityvaultizabilityPercent}% billing invoice connectabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageConnectabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production connectabilityvaultizability tools.',
    })
  }
}
