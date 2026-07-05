import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSystematizabilityRolloutGuidance,
  systematizabilityAdminActionRequestSchema,
  systematizabilityAdminActionResponseSchema,
  systematizabilityAdminSummaryResponseSchema,
  systematizabilityCapabilitiesResponseSchema,
  systematizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSystematizabilityAdminRecords,
  buildSystematizabilityAdminStats,
  getSystematizabilityAdminGuidance,
  resolveSystematizabilityAdminActions,
} from './systematizability-admin.helpers.js'
import { evaluateSystematizabilityRollout } from './systematizability-rollout.helpers.js'
import { SystematizabilityStatusService } from './systematizability-status.service.js'

@Injectable()
export class SystematizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly systematizabilityStatusService: SystematizabilityStatusService,
  ) {}

  getCapabilities() {
    return systematizabilityCapabilitiesResponseSchema.parse({
      supportsSystematizabilityRollout: true,
      supportsSystematizabilityAdminTools: true,
      supportsBillingWebhookSystematizabilitySignals: true,
      supportsBillingRecordSystematizabilitySignals: true,
      guidance: getSystematizabilityRolloutGuidance(),
    })
  }

  async getSystematizabilityRollout() {
    const systematizabilityTableCoverage =
      await this.systematizabilityStatusService.getSystematizabilityTableCoverage()

    const rollout = evaluateSystematizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.systematizabilityStatusService.pingPostgres(),
      existingSystematizabilityTableCount: systematizabilityTableCoverage.existingSystematizabilityTableCount,
      billingWebhookEventsTableExists: systematizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: systematizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: systematizabilityTableCoverage.usageEventsTableExists,
    })

    return systematizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSystematizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSystematizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.systematizabilityStatusService.getWorkspaceSystematizabilityInventory(
        workspaceId,
      )
    const records = buildSystematizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.systematizabilityStatusService.pingPostgres()
    const stats = buildSystematizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return systematizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSystematizabilityAdminActions(),
      guidance: getSystematizabilityAdminGuidance({ stats }),
    })
  }

  async executeSystematizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_systematizability_summary'
    },
  ) {
    this.assertCanManageSystematizability(authContext)

    const payload = systematizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_systematizability_summary': {
        const summary = await this.getWorkspaceSystematizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return systematizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed systematizability summary with ${summary.stats.systematizabilityPercent}% billing webhook systematizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSystematizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production systematizability tools.',
    })
  }
}
