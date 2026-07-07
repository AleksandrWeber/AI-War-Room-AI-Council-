import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGovernanceizabilityRolloutGuidance,
  governanceizabilityAdminActionRequestSchema,
  governanceizabilityAdminActionResponseSchema,
  governanceizabilityAdminSummaryResponseSchema,
  governanceizabilityCapabilitiesResponseSchema,
  governanceizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGovernanceizabilityAdminRecords,
  buildGovernanceizabilityAdminStats,
  getGovernanceizabilityAdminGuidance,
  resolveGovernanceizabilityAdminActions,
} from './governanceizability-admin.helpers.js'
import { evaluateGovernanceizabilityRollout } from './governanceizability-rollout.helpers.js'
import { GovernanceizabilityStatusService } from './governanceizability-status.service.js'

@Injectable()
export class GovernanceizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly governanceizabilityStatusService: GovernanceizabilityStatusService,
  ) {}

  getCapabilities() {
    return governanceizabilityCapabilitiesResponseSchema.parse({
      supportsGovernanceizabilityRollout: true,
      supportsGovernanceizabilityAdminTools: true,
      supportsBillingNotificationGovernanceizabilitySignals: true,
      supportsBillingWebhookGovernanceizabilitySignals: true,
      guidance: getGovernanceizabilityRolloutGuidance(),
    })
  }

  async getGovernanceizabilityRollout() {
    const governanceizabilityTableCoverage =
      await this.governanceizabilityStatusService.getGovernanceizabilityTableCoverage()

    const rollout = evaluateGovernanceizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.governanceizabilityStatusService.pingPostgres(),
      existingGovernanceizabilityTableCount: governanceizabilityTableCoverage.existingGovernanceizabilityTableCount,
      billingNotificationsTableExists: governanceizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: governanceizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: governanceizabilityTableCoverage.usageEventsTableExists,
    })

    return governanceizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGovernanceizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGovernanceizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.governanceizabilityStatusService.getWorkspaceGovernanceizabilityInventory(
        workspaceId,
      )
    const records = buildGovernanceizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.governanceizabilityStatusService.pingPostgres()
    const stats = buildGovernanceizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return governanceizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGovernanceizabilityAdminActions(),
      guidance: getGovernanceizabilityAdminGuidance({ stats }),
    })
  }

  async executeGovernanceizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_governanceizability_summary'
    },
  ) {
    this.assertCanManageGovernanceizability(authContext)

    const payload = governanceizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_governanceizability_summary': {
        const summary = await this.getWorkspaceGovernanceizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return governanceizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed governanceizability summary with ${summary.stats.governanceizabilityPercent}% billing notification governanceizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGovernanceizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production governanceizability tools.',
    })
  }
}
