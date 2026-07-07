import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProvenanceizabilityRolloutGuidance,
  provenanceizabilityAdminActionRequestSchema,
  provenanceizabilityAdminActionResponseSchema,
  provenanceizabilityAdminSummaryResponseSchema,
  provenanceizabilityCapabilitiesResponseSchema,
  provenanceizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProvenanceizabilityAdminRecords,
  buildProvenanceizabilityAdminStats,
  getProvenanceizabilityAdminGuidance,
  resolveProvenanceizabilityAdminActions,
} from './provenanceizability-admin.helpers.js'
import { evaluateProvenanceizabilityRollout } from './provenanceizability-rollout.helpers.js'
import { ProvenanceizabilityStatusService } from './provenanceizability-status.service.js'

@Injectable()
export class ProvenanceizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly provenanceizabilityStatusService: ProvenanceizabilityStatusService,
  ) {}

  getCapabilities() {
    return provenanceizabilityCapabilitiesResponseSchema.parse({
      supportsProvenanceizabilityRollout: true,
      supportsProvenanceizabilityAdminTools: true,
      supportsBillingInvoiceProvenanceizabilitySignals: true,
      supportsBillingRecordProvenanceizabilitySignals: true,
      guidance: getProvenanceizabilityRolloutGuidance(),
    })
  }

  async getProvenanceizabilityRollout() {
    const provenanceizabilityTableCoverage =
      await this.provenanceizabilityStatusService.getProvenanceizabilityTableCoverage()

    const rollout = evaluateProvenanceizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.provenanceizabilityStatusService.pingPostgres(),
      existingProvenanceizabilityTableCount: provenanceizabilityTableCoverage.existingProvenanceizabilityTableCount,
      billingInvoicesTableExists: provenanceizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: provenanceizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: provenanceizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return provenanceizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProvenanceizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProvenanceizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.provenanceizabilityStatusService.getWorkspaceProvenanceizabilityInventory(
        workspaceId,
      )
    const records = buildProvenanceizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.provenanceizabilityStatusService.pingPostgres()
    const stats = buildProvenanceizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return provenanceizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProvenanceizabilityAdminActions(),
      guidance: getProvenanceizabilityAdminGuidance({ stats }),
    })
  }

  async executeProvenanceizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_provenanceizability_summary'
    },
  ) {
    this.assertCanManageProvenanceizability(authContext)

    const payload = provenanceizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_provenanceizability_summary': {
        const summary = await this.getWorkspaceProvenanceizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return provenanceizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed provenanceizability summary with ${summary.stats.provenanceizabilityPercent}% billing invoice provenanceizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProvenanceizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production provenanceizability tools.',
    })
  }
}
