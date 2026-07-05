import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRestoreizabilityRolloutGuidance,
  restoreizabilityAdminActionRequestSchema,
  restoreizabilityAdminActionResponseSchema,
  restoreizabilityAdminSummaryResponseSchema,
  restoreizabilityCapabilitiesResponseSchema,
  restoreizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRestoreizabilityAdminRecords,
  buildRestoreizabilityAdminStats,
  getRestoreizabilityAdminGuidance,
  resolveRestoreizabilityAdminActions,
} from './restoreizability-admin.helpers.js'
import { evaluateRestoreizabilityRollout } from './restoreizability-rollout.helpers.js'
import { RestoreizabilityStatusService } from './restoreizability-status.service.js'

@Injectable()
export class RestoreizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly restoreizabilityStatusService: RestoreizabilityStatusService,
  ) {}

  getCapabilities() {
    return restoreizabilityCapabilitiesResponseSchema.parse({
      supportsRestoreizabilityRollout: true,
      supportsRestoreizabilityAdminTools: true,
      supportsBillingWebhookRestoreizabilitySignals: true,
      supportsBillingRecordRestoreizabilitySignals: true,
      guidance: getRestoreizabilityRolloutGuidance(),
    })
  }

  async getRestoreizabilityRollout() {
    const restoreizabilityTableCoverage =
      await this.restoreizabilityStatusService.getRestoreizabilityTableCoverage()

    const rollout = evaluateRestoreizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.restoreizabilityStatusService.pingPostgres(),
      existingRestoreizabilityTableCount: restoreizabilityTableCoverage.existingRestoreizabilityTableCount,
      billingWebhookEventsTableExists: restoreizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: restoreizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: restoreizabilityTableCoverage.usageEventsTableExists,
    })

    return restoreizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRestoreizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRestoreizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.restoreizabilityStatusService.getWorkspaceRestoreizabilityInventory(
        workspaceId,
      )
    const records = buildRestoreizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.restoreizabilityStatusService.pingPostgres()
    const stats = buildRestoreizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return restoreizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRestoreizabilityAdminActions(),
      guidance: getRestoreizabilityAdminGuidance({ stats }),
    })
  }

  async executeRestoreizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_restoreizability_summary'
    },
  ) {
    this.assertCanManageRestoreizability(authContext)

    const payload = restoreizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_restoreizability_summary': {
        const summary = await this.getWorkspaceRestoreizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return restoreizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed restoreizability summary with ${summary.stats.restoreizabilityPercent}% billing webhook restoreizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRestoreizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production restoreizability tools.',
    })
  }
}
