import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompatibilizabilityRolloutGuidance,
  compatibilizabilityAdminActionRequestSchema,
  compatibilizabilityAdminActionResponseSchema,
  compatibilizabilityAdminSummaryResponseSchema,
  compatibilizabilityCapabilitiesResponseSchema,
  compatibilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompatibilizabilityAdminRecords,
  buildCompatibilizabilityAdminStats,
  getCompatibilizabilityAdminGuidance,
  resolveCompatibilizabilityAdminActions,
} from './compatibilizability-admin.helpers.js'
import { evaluateCompatibilizabilityRollout } from './compatibilizability-rollout.helpers.js'
import { CompatibilizabilityStatusService } from './compatibilizability-status.service.js'

@Injectable()
export class CompatibilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compatibilizabilityStatusService: CompatibilizabilityStatusService,
  ) {}

  getCapabilities() {
    return compatibilizabilityCapabilitiesResponseSchema.parse({
      supportsCompatibilizabilityRollout: true,
      supportsCompatibilizabilityAdminTools: true,
      supportsBillingWebhookCompatibilizabilitySignals: true,
      supportsBillingRecordCompatibilizabilitySignals: true,
      guidance: getCompatibilizabilityRolloutGuidance(),
    })
  }

  async getCompatibilizabilityRollout() {
    const compatibilizabilityTableCoverage =
      await this.compatibilizabilityStatusService.getCompatibilizabilityTableCoverage()

    const rollout = evaluateCompatibilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compatibilizabilityStatusService.pingPostgres(),
      existingCompatibilizabilityTableCount: compatibilizabilityTableCoverage.existingCompatibilizabilityTableCount,
      billingWebhookEventsTableExists: compatibilizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: compatibilizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: compatibilizabilityTableCoverage.usageEventsTableExists,
    })

    return compatibilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompatibilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompatibilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compatibilizabilityStatusService.getWorkspaceCompatibilizabilityInventory(
        workspaceId,
      )
    const records = buildCompatibilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compatibilizabilityStatusService.pingPostgres()
    const stats = buildCompatibilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compatibilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompatibilizabilityAdminActions(),
      guidance: getCompatibilizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompatibilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compatibilizability_summary'
    },
  ) {
    this.assertCanManageCompatibilizability(authContext)

    const payload = compatibilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compatibilizability_summary': {
        const summary = await this.getWorkspaceCompatibilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compatibilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compatibilizability summary with ${summary.stats.compatibilizabilityPercent}% billing webhook compatibilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompatibilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compatibilizability tools.',
    })
  }
}
