import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getThrottleizabilityRolloutGuidance,
  throttleizabilityAdminActionRequestSchema,
  throttleizabilityAdminActionResponseSchema,
  throttleizabilityAdminSummaryResponseSchema,
  throttleizabilityCapabilitiesResponseSchema,
  throttleizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildThrottleizabilityAdminRecords,
  buildThrottleizabilityAdminStats,
  getThrottleizabilityAdminGuidance,
  resolveThrottleizabilityAdminActions,
} from './throttleizability-admin.helpers.js'
import { evaluateThrottleizabilityRollout } from './throttleizability-rollout.helpers.js'
import { ThrottleizabilityStatusService } from './throttleizability-status.service.js'

@Injectable()
export class ThrottleizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly throttleizabilityStatusService: ThrottleizabilityStatusService,
  ) {}

  getCapabilities() {
    return throttleizabilityCapabilitiesResponseSchema.parse({
      supportsThrottleizabilityRollout: true,
      supportsThrottleizabilityAdminTools: true,
      supportsProviderCredentialThrottleizabilitySignals: true,
      supportsModelRegistryThrottleizabilitySignals: true,
      guidance: getThrottleizabilityRolloutGuidance(),
    })
  }

  async getThrottleizabilityRollout() {
    const throttleizabilityTableCoverage =
      await this.throttleizabilityStatusService.getThrottleizabilityTableCoverage()

    const rollout = evaluateThrottleizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.throttleizabilityStatusService.pingPostgres(),
      existingThrottleizabilityTableCount: throttleizabilityTableCoverage.existingThrottleizabilityTableCount,
      workspaceProviderCredentialsTableExists: throttleizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: throttleizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: throttleizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return throttleizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceThrottleizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageThrottleizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.throttleizabilityStatusService.getWorkspaceThrottleizabilityInventory(
        workspaceId,
      )
    const records = buildThrottleizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.throttleizabilityStatusService.pingPostgres()
    const stats = buildThrottleizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return throttleizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveThrottleizabilityAdminActions(),
      guidance: getThrottleizabilityAdminGuidance({ stats }),
    })
  }

  async executeThrottleizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_throttleizability_summary'
    },
  ) {
    this.assertCanManageThrottleizability(authContext)

    const payload = throttleizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_throttleizability_summary': {
        const summary = await this.getWorkspaceThrottleizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return throttleizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed throttleizability summary with ${summary.stats.throttleizabilityPercent}% provider credential throttleizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageThrottleizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production throttleizability tools.',
    })
  }
}
