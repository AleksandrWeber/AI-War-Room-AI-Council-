import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getVerifiabilityRolloutGuidance,
  verifiabilityAdminActionRequestSchema,
  verifiabilityAdminActionResponseSchema,
  verifiabilityAdminSummaryResponseSchema,
  verifiabilityCapabilitiesResponseSchema,
  verifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildVerifiabilityAdminRecords,
  buildVerifiabilityAdminStats,
  getVerifiabilityAdminGuidance,
  resolveVerifiabilityAdminActions,
} from './verifiability-admin.helpers.js'
import { evaluateVerifiabilityRollout } from './verifiability-rollout.helpers.js'
import { VerifiabilityStatusService } from './verifiability-status.service.js'

@Injectable()
export class VerifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly verifiabilityStatusService: VerifiabilityStatusService,
  ) {}

  getCapabilities() {
    return verifiabilityCapabilitiesResponseSchema.parse({
      supportsVerifiabilityRollout: true,
      supportsVerifiabilityAdminTools: true,
      supportsBillingInvoiceVerifiabilitySignals: true,
      supportsBillingWebhookVerifiabilitySignals: true,
      guidance: getVerifiabilityRolloutGuidance(),
    })
  }

  async getVerifiabilityRollout() {
    const verifiabilityTableCoverage =
      await this.verifiabilityStatusService.getVerifiabilityTableCoverage()

    const rollout = evaluateVerifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.verifiabilityStatusService.pingPostgres(),
      existingVerifiabilityTableCount: verifiabilityTableCoverage.existingVerifiabilityTableCount,
      billingInvoicesTableExists: verifiabilityTableCoverage.billingInvoicesTableExists,
      billingWebhookEventsTableExists: verifiabilityTableCoverage.billingWebhookEventsTableExists,
      billingMeterUsageReportsTableExists: verifiabilityTableCoverage.billingMeterUsageReportsTableExists,
    })

    return verifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceVerifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageVerifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.verifiabilityStatusService.getWorkspaceVerifiabilityInventory(
        workspaceId,
      )
    const records = buildVerifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.verifiabilityStatusService.pingPostgres()
    const stats = buildVerifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return verifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveVerifiabilityAdminActions(),
      guidance: getVerifiabilityAdminGuidance({ stats }),
    })
  }

  async executeVerifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_verifiability_summary'
    },
  ) {
    this.assertCanManageVerifiability(authContext)

    const payload = verifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_verifiability_summary': {
        const summary = await this.getWorkspaceVerifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return verifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed verifiability summary with ${summary.stats.verifiabilityPercent}% billing invoice verifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageVerifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production verifiability tools.',
    })
  }
}
