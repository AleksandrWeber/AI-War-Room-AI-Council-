import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPhenomenizabilityRolloutGuidance,
  phenomenizabilityAdminActionRequestSchema,
  phenomenizabilityAdminActionResponseSchema,
  phenomenizabilityAdminSummaryResponseSchema,
  phenomenizabilityCapabilitiesResponseSchema,
  phenomenizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPhenomenizabilityAdminRecords,
  buildPhenomenizabilityAdminStats,
  getPhenomenizabilityAdminGuidance,
  resolvePhenomenizabilityAdminActions,
} from './phenomenizability-admin.helpers.js'
import { evaluatePhenomenizabilityRollout } from './phenomenizability-rollout.helpers.js'
import { PhenomenizabilityStatusService } from './phenomenizability-status.service.js'

@Injectable()
export class PhenomenizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly phenomenizabilityStatusService: PhenomenizabilityStatusService,
  ) {}

  getCapabilities() {
    return phenomenizabilityCapabilitiesResponseSchema.parse({
      supportsPhenomenizabilityRollout: true,
      supportsPhenomenizabilityAdminTools: true,
      supportsBillingInvoicePhenomenizabilitySignals: true,
      supportsBillingRecordPhenomenizabilitySignals: true,
      guidance: getPhenomenizabilityRolloutGuidance(),
    })
  }

  async getPhenomenizabilityRollout() {
    const phenomenizabilityTableCoverage =
      await this.phenomenizabilityStatusService.getPhenomenizabilityTableCoverage()

    const rollout = evaluatePhenomenizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.phenomenizabilityStatusService.pingPostgres(),
      existingPhenomenizabilityTableCount: phenomenizabilityTableCoverage.existingPhenomenizabilityTableCount,
      billingInvoicesTableExists: phenomenizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: phenomenizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: phenomenizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return phenomenizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePhenomenizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePhenomenizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.phenomenizabilityStatusService.getWorkspacePhenomenizabilityInventory(
        workspaceId,
      )
    const records = buildPhenomenizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.phenomenizabilityStatusService.pingPostgres()
    const stats = buildPhenomenizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return phenomenizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePhenomenizabilityAdminActions(),
      guidance: getPhenomenizabilityAdminGuidance({ stats }),
    })
  }

  async executePhenomenizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_phenomenizability_summary'
    },
  ) {
    this.assertCanManagePhenomenizability(authContext)

    const payload = phenomenizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_phenomenizability_summary': {
        const summary = await this.getWorkspacePhenomenizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return phenomenizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed phenomenizability summary with ${summary.stats.phenomenizabilityPercent}% billing invoice phenomenizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePhenomenizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production phenomenizability tools.',
    })
  }
}
