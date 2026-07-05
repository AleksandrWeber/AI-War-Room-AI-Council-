import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getExtensibilizabilityRolloutGuidance,
  extensibilizabilityAdminActionRequestSchema,
  extensibilizabilityAdminActionResponseSchema,
  extensibilizabilityAdminSummaryResponseSchema,
  extensibilizabilityCapabilitiesResponseSchema,
  extensibilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildExtensibilizabilityAdminRecords,
  buildExtensibilizabilityAdminStats,
  getExtensibilizabilityAdminGuidance,
  resolveExtensibilizabilityAdminActions,
} from './extensibilizability-admin.helpers.js'
import { evaluateExtensibilizabilityRollout } from './extensibilizability-rollout.helpers.js'
import { ExtensibilizabilityStatusService } from './extensibilizability-status.service.js'

@Injectable()
export class ExtensibilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly extensibilizabilityStatusService: ExtensibilizabilityStatusService,
  ) {}

  getCapabilities() {
    return extensibilizabilityCapabilitiesResponseSchema.parse({
      supportsExtensibilizabilityRollout: true,
      supportsExtensibilizabilityAdminTools: true,
      supportsBillingInvoiceExtensibilizabilitySignals: true,
      supportsBillingRecordExtensibilizabilitySignals: true,
      guidance: getExtensibilizabilityRolloutGuidance(),
    })
  }

  async getExtensibilizabilityRollout() {
    const extensibilizabilityTableCoverage =
      await this.extensibilizabilityStatusService.getExtensibilizabilityTableCoverage()

    const rollout = evaluateExtensibilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.extensibilizabilityStatusService.pingPostgres(),
      existingExtensibilizabilityTableCount: extensibilizabilityTableCoverage.existingExtensibilizabilityTableCount,
      billingInvoicesTableExists: extensibilizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: extensibilizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: extensibilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return extensibilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceExtensibilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageExtensibilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.extensibilizabilityStatusService.getWorkspaceExtensibilizabilityInventory(
        workspaceId,
      )
    const records = buildExtensibilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.extensibilizabilityStatusService.pingPostgres()
    const stats = buildExtensibilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return extensibilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveExtensibilizabilityAdminActions(),
      guidance: getExtensibilizabilityAdminGuidance({ stats }),
    })
  }

  async executeExtensibilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_extensibilizability_summary'
    },
  ) {
    this.assertCanManageExtensibilizability(authContext)

    const payload = extensibilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_extensibilizability_summary': {
        const summary = await this.getWorkspaceExtensibilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return extensibilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed extensibilizability summary with ${summary.stats.extensibilizabilityPercent}% billing invoice extensibilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageExtensibilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production extensibilizability tools.',
    })
  }
}
