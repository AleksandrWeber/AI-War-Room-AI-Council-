import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSymbolizabilityRolloutGuidance,
  symbolizabilityAdminActionRequestSchema,
  symbolizabilityAdminActionResponseSchema,
  symbolizabilityAdminSummaryResponseSchema,
  symbolizabilityCapabilitiesResponseSchema,
  symbolizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSymbolizabilityAdminRecords,
  buildSymbolizabilityAdminStats,
  getSymbolizabilityAdminGuidance,
  resolveSymbolizabilityAdminActions,
} from './symbolizability-admin.helpers.js'
import { evaluateSymbolizabilityRollout } from './symbolizability-rollout.helpers.js'
import { SymbolizabilityStatusService } from './symbolizability-status.service.js'

@Injectable()
export class SymbolizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly symbolizabilityStatusService: SymbolizabilityStatusService,
  ) {}

  getCapabilities() {
    return symbolizabilityCapabilitiesResponseSchema.parse({
      supportsSymbolizabilityRollout: true,
      supportsSymbolizabilityAdminTools: true,
      supportsBillingRecordSymbolizabilitySignals: true,
      supportsBillingInvoiceSymbolizabilitySignals: true,
      guidance: getSymbolizabilityRolloutGuidance(),
    })
  }

  async getSymbolizabilityRollout() {
    const symbolizabilityTableCoverage =
      await this.symbolizabilityStatusService.getSymbolizabilityTableCoverage()

    const rollout = evaluateSymbolizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.symbolizabilityStatusService.pingPostgres(),
      existingSymbolizabilityTableCount: symbolizabilityTableCoverage.existingSymbolizabilityTableCount,
      billingRecordsTableExists: symbolizabilityTableCoverage.billingRecordsTableExists,
      billingInvoicesTableExists: symbolizabilityTableCoverage.billingInvoicesTableExists,
      usageEventsTableExists: symbolizabilityTableCoverage.usageEventsTableExists,
    })

    return symbolizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSymbolizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSymbolizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.symbolizabilityStatusService.getWorkspaceSymbolizabilityInventory(
        workspaceId,
      )
    const records = buildSymbolizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.symbolizabilityStatusService.pingPostgres()
    const stats = buildSymbolizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return symbolizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSymbolizabilityAdminActions(),
      guidance: getSymbolizabilityAdminGuidance({ stats }),
    })
  }

  async executeSymbolizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_symbolizability_summary'
    },
  ) {
    this.assertCanManageSymbolizability(authContext)

    const payload = symbolizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_symbolizability_summary': {
        const summary = await this.getWorkspaceSymbolizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return symbolizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed symbolizability summary with ${summary.stats.symbolizabilityPercent}% billing record symbolizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSymbolizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production symbolizability tools.',
    })
  }
}
