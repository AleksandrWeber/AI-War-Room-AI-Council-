import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRestorabilizabilityRolloutGuidance,
  restorabilizabilityAdminActionRequestSchema,
  restorabilizabilityAdminActionResponseSchema,
  restorabilizabilityAdminSummaryResponseSchema,
  restorabilizabilityCapabilitiesResponseSchema,
  restorabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRestorabilizabilityAdminRecords,
  buildRestorabilizabilityAdminStats,
  getRestorabilizabilityAdminGuidance,
  resolveRestorabilizabilityAdminActions,
} from './restorabilizability-admin.helpers.js'
import { evaluateRestorabilizabilityRollout } from './restorabilizability-rollout.helpers.js'
import { RestorabilizabilityStatusService } from './restorabilizability-status.service.js'

@Injectable()
export class RestorabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly restorabilizabilityStatusService: RestorabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return restorabilizabilityCapabilitiesResponseSchema.parse({
      supportsRestorabilizabilityRollout: true,
      supportsRestorabilizabilityAdminTools: true,
      supportsBillingWebhookRestorabilizabilitySignals: true,
      supportsBillingRecordRestorabilizabilitySignals: true,
      guidance: getRestorabilizabilityRolloutGuidance(),
    })
  }

  async getRestorabilizabilityRollout() {
    const restorabilizabilityTableCoverage =
      await this.restorabilizabilityStatusService.getRestorabilizabilityTableCoverage()

    const rollout = evaluateRestorabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.restorabilizabilityStatusService.pingPostgres(),
      existingRestorabilizabilityTableCount: restorabilizabilityTableCoverage.existingRestorabilizabilityTableCount,
      billingWebhookEventsTableExists: restorabilizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: restorabilizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: restorabilizabilityTableCoverage.usageEventsTableExists,
    })

    return restorabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRestorabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRestorabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.restorabilizabilityStatusService.getWorkspaceRestorabilizabilityInventory(
        workspaceId,
      )
    const records = buildRestorabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.restorabilizabilityStatusService.pingPostgres()
    const stats = buildRestorabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return restorabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRestorabilizabilityAdminActions(),
      guidance: getRestorabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeRestorabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_restorabilizability_summary'
    },
  ) {
    this.assertCanManageRestorabilizability(authContext)

    const payload = restorabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_restorabilizability_summary': {
        const summary = await this.getWorkspaceRestorabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return restorabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed restorabilizability summary with ${summary.stats.restorabilizabilityPercent}% billing webhook restorabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRestorabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production restorabilizability tools.',
    })
  }
}
