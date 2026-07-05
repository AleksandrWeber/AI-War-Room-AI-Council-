import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAcceptabilityRolloutGuidance,
  acceptabilityAdminActionRequestSchema,
  acceptabilityAdminActionResponseSchema,
  acceptabilityAdminSummaryResponseSchema,
  acceptabilityCapabilitiesResponseSchema,
  acceptabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAcceptabilityAdminRecords,
  buildAcceptabilityAdminStats,
  getAcceptabilityAdminGuidance,
  resolveAcceptabilityAdminActions,
} from './acceptability-admin.helpers.js'
import { evaluateAcceptabilityRollout } from './acceptability-rollout.helpers.js'
import { AcceptabilityStatusService } from './acceptability-status.service.js'

@Injectable()
export class AcceptabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly acceptabilityStatusService: AcceptabilityStatusService,
  ) {}

  getCapabilities() {
    return acceptabilityCapabilitiesResponseSchema.parse({
      supportsAcceptabilityRollout: true,
      supportsAcceptabilityAdminTools: true,
      supportsBillingRecordAcceptabilitySignals: true,
      supportsBillingInvoiceAcceptabilitySignals: true,
      guidance: getAcceptabilityRolloutGuidance(),
    })
  }

  async getAcceptabilityRollout() {
    const acceptabilityTableCoverage =
      await this.acceptabilityStatusService.getAcceptabilityTableCoverage()

    const rollout = evaluateAcceptabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.acceptabilityStatusService.pingPostgres(),
      existingAcceptabilityTableCount: acceptabilityTableCoverage.existingAcceptabilityTableCount,
      billingRecordsTableExists: acceptabilityTableCoverage.billingRecordsTableExists,
      billingInvoicesTableExists: acceptabilityTableCoverage.billingInvoicesTableExists,
      workspaceUsageLimitsTableExists: acceptabilityTableCoverage.workspaceUsageLimitsTableExists,
    })

    return acceptabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAcceptabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAcceptability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.acceptabilityStatusService.getWorkspaceAcceptabilityInventory(
        workspaceId,
      )
    const records = buildAcceptabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.acceptabilityStatusService.pingPostgres()
    const stats = buildAcceptabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return acceptabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAcceptabilityAdminActions(),
      guidance: getAcceptabilityAdminGuidance({ stats }),
    })
  }

  async executeAcceptabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_acceptability_summary'
    },
  ) {
    this.assertCanManageAcceptability(authContext)

    const payload = acceptabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_acceptability_summary': {
        const summary = await this.getWorkspaceAcceptabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return acceptabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed acceptability summary with ${summary.stats.acceptabilityPercent}% billing record acceptability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAcceptability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production acceptability tools.',
    })
  }
}
