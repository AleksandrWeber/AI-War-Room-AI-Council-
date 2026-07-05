import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGroupizabilityRolloutGuidance,
  groupizabilityAdminActionRequestSchema,
  groupizabilityAdminActionResponseSchema,
  groupizabilityAdminSummaryResponseSchema,
  groupizabilityCapabilitiesResponseSchema,
  groupizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGroupizabilityAdminRecords,
  buildGroupizabilityAdminStats,
  getGroupizabilityAdminGuidance,
  resolveGroupizabilityAdminActions,
} from './groupizability-admin.helpers.js'
import { evaluateGroupizabilityRollout } from './groupizability-rollout.helpers.js'
import { GroupizabilityStatusService } from './groupizability-status.service.js'

@Injectable()
export class GroupizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly groupizabilityStatusService: GroupizabilityStatusService,
  ) {}

  getCapabilities() {
    return groupizabilityCapabilitiesResponseSchema.parse({
      supportsGroupizabilityRollout: true,
      supportsGroupizabilityAdminTools: true,
      supportsShieldScanGroupizabilitySignals: true,
      supportsProviderCredentialGroupizabilitySignals: true,
      guidance: getGroupizabilityRolloutGuidance(),
    })
  }

  async getGroupizabilityRollout() {
    const groupizabilityTableCoverage =
      await this.groupizabilityStatusService.getGroupizabilityTableCoverage()

    const rollout = evaluateGroupizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.groupizabilityStatusService.pingPostgres(),
      existingGroupizabilityTableCount: groupizabilityTableCoverage.existingGroupizabilityTableCount,
      shieldScansTableExists: groupizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: groupizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: groupizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return groupizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGroupizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGroupizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.groupizabilityStatusService.getWorkspaceGroupizabilityInventory(
        workspaceId,
      )
    const records = buildGroupizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.groupizabilityStatusService.pingPostgres()
    const stats = buildGroupizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return groupizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGroupizabilityAdminActions(),
      guidance: getGroupizabilityAdminGuidance({ stats }),
    })
  }

  async executeGroupizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_groupizability_summary'
    },
  ) {
    this.assertCanManageGroupizability(authContext)

    const payload = groupizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_groupizability_summary': {
        const summary = await this.getWorkspaceGroupizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return groupizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed groupizability summary with ${summary.stats.groupizabilityPercent}% shield scan groupizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGroupizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production groupizability tools.',
    })
  }
}
