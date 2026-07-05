import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getStylizabilityRolloutGuidance,
  stylizabilityAdminActionRequestSchema,
  stylizabilityAdminActionResponseSchema,
  stylizabilityAdminSummaryResponseSchema,
  stylizabilityCapabilitiesResponseSchema,
  stylizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildStylizabilityAdminRecords,
  buildStylizabilityAdminStats,
  getStylizabilityAdminGuidance,
  resolveStylizabilityAdminActions,
} from './stylizability-admin.helpers.js'
import { evaluateStylizabilityRollout } from './stylizability-rollout.helpers.js'
import { StylizabilityStatusService } from './stylizability-status.service.js'

@Injectable()
export class StylizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly stylizabilityStatusService: StylizabilityStatusService,
  ) {}

  getCapabilities() {
    return stylizabilityCapabilitiesResponseSchema.parse({
      supportsStylizabilityRollout: true,
      supportsStylizabilityAdminTools: true,
      supportsBillingInvoiceStylizabilitySignals: true,
      supportsBillingRecordStylizabilitySignals: true,
      guidance: getStylizabilityRolloutGuidance(),
    })
  }

  async getStylizabilityRollout() {
    const stylizabilityTableCoverage =
      await this.stylizabilityStatusService.getStylizabilityTableCoverage()

    const rollout = evaluateStylizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.stylizabilityStatusService.pingPostgres(),
      existingStylizabilityTableCount: stylizabilityTableCoverage.existingStylizabilityTableCount,
      billingInvoicesTableExists: stylizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: stylizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: stylizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return stylizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceStylizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageStylizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.stylizabilityStatusService.getWorkspaceStylizabilityInventory(
        workspaceId,
      )
    const records = buildStylizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.stylizabilityStatusService.pingPostgres()
    const stats = buildStylizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return stylizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveStylizabilityAdminActions(),
      guidance: getStylizabilityAdminGuidance({ stats }),
    })
  }

  async executeStylizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_stylizability_summary'
    },
  ) {
    this.assertCanManageStylizability(authContext)

    const payload = stylizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_stylizability_summary': {
        const summary = await this.getWorkspaceStylizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return stylizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed stylizability summary with ${summary.stats.stylizabilityPercent}% billing invoice stylizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageStylizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production stylizability tools.',
    })
  }
}
