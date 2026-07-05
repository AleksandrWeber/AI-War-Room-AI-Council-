import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDecompressizabilityRolloutGuidance,
  decompressizabilityAdminActionRequestSchema,
  decompressizabilityAdminActionResponseSchema,
  decompressizabilityAdminSummaryResponseSchema,
  decompressizabilityCapabilitiesResponseSchema,
  decompressizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDecompressizabilityAdminRecords,
  buildDecompressizabilityAdminStats,
  getDecompressizabilityAdminGuidance,
  resolveDecompressizabilityAdminActions,
} from './decompressizability-admin.helpers.js'
import { evaluateDecompressizabilityRollout } from './decompressizability-rollout.helpers.js'
import { DecompressizabilityStatusService } from './decompressizability-status.service.js'

@Injectable()
export class DecompressizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly decompressizabilityStatusService: DecompressizabilityStatusService,
  ) {}

  getCapabilities() {
    return decompressizabilityCapabilitiesResponseSchema.parse({
      supportsDecompressizabilityRollout: true,
      supportsDecompressizabilityAdminTools: true,
      supportsBillingInvoiceDecompressizabilitySignals: true,
      supportsBillingRecordDecompressizabilitySignals: true,
      guidance: getDecompressizabilityRolloutGuidance(),
    })
  }

  async getDecompressizabilityRollout() {
    const decompressizabilityTableCoverage =
      await this.decompressizabilityStatusService.getDecompressizabilityTableCoverage()

    const rollout = evaluateDecompressizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.decompressizabilityStatusService.pingPostgres(),
      existingDecompressizabilityTableCount: decompressizabilityTableCoverage.existingDecompressizabilityTableCount,
      billingInvoicesTableExists: decompressizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: decompressizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: decompressizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return decompressizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDecompressizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDecompressizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.decompressizabilityStatusService.getWorkspaceDecompressizabilityInventory(
        workspaceId,
      )
    const records = buildDecompressizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.decompressizabilityStatusService.pingPostgres()
    const stats = buildDecompressizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return decompressizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDecompressizabilityAdminActions(),
      guidance: getDecompressizabilityAdminGuidance({ stats }),
    })
  }

  async executeDecompressizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_decompressizability_summary'
    },
  ) {
    this.assertCanManageDecompressizability(authContext)

    const payload = decompressizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_decompressizability_summary': {
        const summary = await this.getWorkspaceDecompressizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return decompressizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed decompressizability summary with ${summary.stats.decompressizabilityPercent}% billing invoice decompressizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDecompressizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production decompressizability tools.',
    })
  }
}
