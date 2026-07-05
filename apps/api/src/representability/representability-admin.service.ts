import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRepresentabilityRolloutGuidance,
  representabilityAdminActionRequestSchema,
  representabilityAdminActionResponseSchema,
  representabilityAdminSummaryResponseSchema,
  representabilityCapabilitiesResponseSchema,
  representabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRepresentabilityAdminRecords,
  buildRepresentabilityAdminStats,
  getRepresentabilityAdminGuidance,
  resolveRepresentabilityAdminActions,
} from './representability-admin.helpers.js'
import { evaluateRepresentabilityRollout } from './representability-rollout.helpers.js'
import { RepresentabilityStatusService } from './representability-status.service.js'

@Injectable()
export class RepresentabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly representabilityStatusService: RepresentabilityStatusService,
  ) {}

  getCapabilities() {
    return representabilityCapabilitiesResponseSchema.parse({
      supportsRepresentabilityRollout: true,
      supportsRepresentabilityAdminTools: true,
      supportsBillingInvoiceRepresentabilitySignals: true,
      supportsBillingRecordRepresentabilitySignals: true,
      guidance: getRepresentabilityRolloutGuidance(),
    })
  }

  async getRepresentabilityRollout() {
    const representabilityTableCoverage =
      await this.representabilityStatusService.getRepresentabilityTableCoverage()

    const rollout = evaluateRepresentabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.representabilityStatusService.pingPostgres(),
      existingRepresentabilityTableCount: representabilityTableCoverage.existingRepresentabilityTableCount,
      billingInvoicesTableExists: representabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: representabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: representabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return representabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRepresentabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRepresentability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.representabilityStatusService.getWorkspaceRepresentabilityInventory(
        workspaceId,
      )
    const records = buildRepresentabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.representabilityStatusService.pingPostgres()
    const stats = buildRepresentabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return representabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRepresentabilityAdminActions(),
      guidance: getRepresentabilityAdminGuidance({ stats }),
    })
  }

  async executeRepresentabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_representability_summary'
    },
  ) {
    this.assertCanManageRepresentability(authContext)

    const payload = representabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_representability_summary': {
        const summary = await this.getWorkspaceRepresentabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return representabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed representability summary with ${summary.stats.representabilityPercent}% billing invoice representability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRepresentability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production representability tools.',
    })
  }
}
