import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReferencabilityvaultizabilityRolloutGuidance,
  referencabilityvaultizabilityAdminActionRequestSchema,
  referencabilityvaultizabilityAdminActionResponseSchema,
  referencabilityvaultizabilityAdminSummaryResponseSchema,
  referencabilityvaultizabilityCapabilitiesResponseSchema,
  referencabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReferencabilityvaultizabilityAdminRecords,
  buildReferencabilityvaultizabilityAdminStats,
  getReferencabilityvaultizabilityAdminGuidance,
  resolveReferencabilityvaultizabilityAdminActions,
} from './referencabilityvaultizability-admin.helpers.js'
import { evaluateReferencabilityvaultizabilityRollout } from './referencabilityvaultizability-rollout.helpers.js'
import { ReferencabilityvaultizabilityStatusService } from './referencabilityvaultizability-status.service.js'

@Injectable()
export class ReferencabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly referencabilityvaultizabilityStatusService: ReferencabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return referencabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsReferencabilityvaultizabilityRollout: true,
      supportsReferencabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceReferencabilityvaultizabilitySignals: true,
      supportsBillingRecordReferencabilityvaultizabilitySignals: true,
      guidance: getReferencabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getReferencabilityvaultizabilityRollout() {
    const referencabilityvaultizabilityTableCoverage =
      await this.referencabilityvaultizabilityStatusService.getReferencabilityvaultizabilityTableCoverage()

    const rollout = evaluateReferencabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.referencabilityvaultizabilityStatusService.pingPostgres(),
      existingReferencabilityvaultizabilityTableCount: referencabilityvaultizabilityTableCoverage.existingReferencabilityvaultizabilityTableCount,
      billingInvoicesTableExists: referencabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: referencabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: referencabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return referencabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReferencabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReferencabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.referencabilityvaultizabilityStatusService.getWorkspaceReferencabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildReferencabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.referencabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildReferencabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return referencabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReferencabilityvaultizabilityAdminActions(),
      guidance: getReferencabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeReferencabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_referencabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageReferencabilityvaultizability(authContext)

    const payload = referencabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_referencabilityvaultizability_summary': {
        const summary = await this.getWorkspaceReferencabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return referencabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed referencabilityvaultizability summary with ${summary.stats.referencabilityvaultizabilityPercent}% billing invoice referencabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReferencabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production referencabilityvaultizability tools.',
    })
  }
}
