import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCircuitizabilityRolloutGuidance,
  circuitizabilityAdminActionRequestSchema,
  circuitizabilityAdminActionResponseSchema,
  circuitizabilityAdminSummaryResponseSchema,
  circuitizabilityCapabilitiesResponseSchema,
  circuitizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCircuitizabilityAdminRecords,
  buildCircuitizabilityAdminStats,
  getCircuitizabilityAdminGuidance,
  resolveCircuitizabilityAdminActions,
} from './circuitizability-admin.helpers.js'
import { evaluateCircuitizabilityRollout } from './circuitizability-rollout.helpers.js'
import { CircuitizabilityStatusService } from './circuitizability-status.service.js'

@Injectable()
export class CircuitizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly circuitizabilityStatusService: CircuitizabilityStatusService,
  ) {}

  getCapabilities() {
    return circuitizabilityCapabilitiesResponseSchema.parse({
      supportsCircuitizabilityRollout: true,
      supportsCircuitizabilityAdminTools: true,
      supportsBillingInvoiceCircuitizabilitySignals: true,
      supportsBillingRecordCircuitizabilitySignals: true,
      guidance: getCircuitizabilityRolloutGuidance(),
    })
  }

  async getCircuitizabilityRollout() {
    const circuitizabilityTableCoverage =
      await this.circuitizabilityStatusService.getCircuitizabilityTableCoverage()

    const rollout = evaluateCircuitizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.circuitizabilityStatusService.pingPostgres(),
      existingCircuitizabilityTableCount: circuitizabilityTableCoverage.existingCircuitizabilityTableCount,
      billingInvoicesTableExists: circuitizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: circuitizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: circuitizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return circuitizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCircuitizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCircuitizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.circuitizabilityStatusService.getWorkspaceCircuitizabilityInventory(
        workspaceId,
      )
    const records = buildCircuitizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.circuitizabilityStatusService.pingPostgres()
    const stats = buildCircuitizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return circuitizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCircuitizabilityAdminActions(),
      guidance: getCircuitizabilityAdminGuidance({ stats }),
    })
  }

  async executeCircuitizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_circuitizability_summary'
    },
  ) {
    this.assertCanManageCircuitizability(authContext)

    const payload = circuitizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_circuitizability_summary': {
        const summary = await this.getWorkspaceCircuitizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return circuitizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed circuitizability summary with ${summary.stats.circuitizabilityPercent}% billing invoice circuitizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCircuitizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production circuitizability tools.',
    })
  }
}
