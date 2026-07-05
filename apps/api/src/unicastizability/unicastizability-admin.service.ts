import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getUnicastizabilityRolloutGuidance,
  unicastizabilityAdminActionRequestSchema,
  unicastizabilityAdminActionResponseSchema,
  unicastizabilityAdminSummaryResponseSchema,
  unicastizabilityCapabilitiesResponseSchema,
  unicastizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildUnicastizabilityAdminRecords,
  buildUnicastizabilityAdminStats,
  getUnicastizabilityAdminGuidance,
  resolveUnicastizabilityAdminActions,
} from './unicastizability-admin.helpers.js'
import { evaluateUnicastizabilityRollout } from './unicastizability-rollout.helpers.js'
import { UnicastizabilityStatusService } from './unicastizability-status.service.js'

@Injectable()
export class UnicastizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly unicastizabilityStatusService: UnicastizabilityStatusService,
  ) {}

  getCapabilities() {
    return unicastizabilityCapabilitiesResponseSchema.parse({
      supportsUnicastizabilityRollout: true,
      supportsUnicastizabilityAdminTools: true,
      supportsBillingWebhookUnicastizabilitySignals: true,
      supportsBillingRecordUnicastizabilitySignals: true,
      guidance: getUnicastizabilityRolloutGuidance(),
    })
  }

  async getUnicastizabilityRollout() {
    const unicastizabilityTableCoverage =
      await this.unicastizabilityStatusService.getUnicastizabilityTableCoverage()

    const rollout = evaluateUnicastizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.unicastizabilityStatusService.pingPostgres(),
      existingUnicastizabilityTableCount: unicastizabilityTableCoverage.existingUnicastizabilityTableCount,
      billingWebhookEventsTableExists: unicastizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: unicastizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: unicastizabilityTableCoverage.usageEventsTableExists,
    })

    return unicastizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceUnicastizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageUnicastizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.unicastizabilityStatusService.getWorkspaceUnicastizabilityInventory(
        workspaceId,
      )
    const records = buildUnicastizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.unicastizabilityStatusService.pingPostgres()
    const stats = buildUnicastizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return unicastizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveUnicastizabilityAdminActions(),
      guidance: getUnicastizabilityAdminGuidance({ stats }),
    })
  }

  async executeUnicastizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_unicastizability_summary'
    },
  ) {
    this.assertCanManageUnicastizability(authContext)

    const payload = unicastizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_unicastizability_summary': {
        const summary = await this.getWorkspaceUnicastizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return unicastizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed unicastizability summary with ${summary.stats.unicastizabilityPercent}% billing webhook unicastizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageUnicastizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production unicastizability tools.',
    })
  }
}
