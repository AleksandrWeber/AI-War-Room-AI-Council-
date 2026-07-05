import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCorroborizabilityRolloutGuidance,
  corroborizabilityAdminActionRequestSchema,
  corroborizabilityAdminActionResponseSchema,
  corroborizabilityAdminSummaryResponseSchema,
  corroborizabilityCapabilitiesResponseSchema,
  corroborizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCorroborizabilityAdminRecords,
  buildCorroborizabilityAdminStats,
  getCorroborizabilityAdminGuidance,
  resolveCorroborizabilityAdminActions,
} from './corroborizability-admin.helpers.js'
import { evaluateCorroborizabilityRollout } from './corroborizability-rollout.helpers.js'
import { CorroborizabilityStatusService } from './corroborizability-status.service.js'

@Injectable()
export class CorroborizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly corroborizabilityStatusService: CorroborizabilityStatusService,
  ) {}

  getCapabilities() {
    return corroborizabilityCapabilitiesResponseSchema.parse({
      supportsCorroborizabilityRollout: true,
      supportsCorroborizabilityAdminTools: true,
      supportsBillingInvoiceCorroborizabilitySignals: true,
      supportsBillingRecordCorroborizabilitySignals: true,
      guidance: getCorroborizabilityRolloutGuidance(),
    })
  }

  async getCorroborizabilityRollout() {
    const corroborizabilityTableCoverage =
      await this.corroborizabilityStatusService.getCorroborizabilityTableCoverage()

    const rollout = evaluateCorroborizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.corroborizabilityStatusService.pingPostgres(),
      existingCorroborizabilityTableCount: corroborizabilityTableCoverage.existingCorroborizabilityTableCount,
      billingInvoicesTableExists: corroborizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: corroborizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: corroborizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return corroborizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCorroborizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCorroborizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.corroborizabilityStatusService.getWorkspaceCorroborizabilityInventory(
        workspaceId,
      )
    const records = buildCorroborizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.corroborizabilityStatusService.pingPostgres()
    const stats = buildCorroborizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return corroborizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCorroborizabilityAdminActions(),
      guidance: getCorroborizabilityAdminGuidance({ stats }),
    })
  }

  async executeCorroborizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_corroborizability_summary'
    },
  ) {
    this.assertCanManageCorroborizability(authContext)

    const payload = corroborizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_corroborizability_summary': {
        const summary = await this.getWorkspaceCorroborizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return corroborizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed corroborizability summary with ${summary.stats.corroborizabilityPercent}% billing invoice corroborizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCorroborizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production corroborizability tools.',
    })
  }
}
