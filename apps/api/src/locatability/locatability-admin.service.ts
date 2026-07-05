import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getLocatabilityRolloutGuidance,
  locatabilityAdminActionRequestSchema,
  locatabilityAdminActionResponseSchema,
  locatabilityAdminSummaryResponseSchema,
  locatabilityCapabilitiesResponseSchema,
  locatabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildLocatabilityAdminRecords,
  buildLocatabilityAdminStats,
  getLocatabilityAdminGuidance,
  resolveLocatabilityAdminActions,
} from './locatability-admin.helpers.js'
import { evaluateLocatabilityRollout } from './locatability-rollout.helpers.js'
import { LocatabilityStatusService } from './locatability-status.service.js'

@Injectable()
export class LocatabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly locatabilityStatusService: LocatabilityStatusService,
  ) {}

  getCapabilities() {
    return locatabilityCapabilitiesResponseSchema.parse({
      supportsLocatabilityRollout: true,
      supportsLocatabilityAdminTools: true,
      supportsProviderCredentialLocatabilitySignals: true,
      supportsWorkspaceLimitLocatabilitySignals: true,
      guidance: getLocatabilityRolloutGuidance(),
    })
  }

  async getLocatabilityRollout() {
    const locatabilityTableCoverage =
      await this.locatabilityStatusService.getLocatabilityTableCoverage()

    const rollout = evaluateLocatabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.locatabilityStatusService.pingPostgres(),
      existingLocatabilityTableCount: locatabilityTableCoverage.existingLocatabilityTableCount,
      workspaceProviderCredentialsTableExists: locatabilityTableCoverage.workspaceProviderCredentialsTableExists,
      workspaceUsageLimitsTableExists: locatabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: locatabilityTableCoverage.usageEventsTableExists,
    })

    return locatabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceLocatabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageLocatability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.locatabilityStatusService.getWorkspaceLocatabilityInventory(
        workspaceId,
      )
    const records = buildLocatabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.locatabilityStatusService.pingPostgres()
    const stats = buildLocatabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return locatabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveLocatabilityAdminActions(),
      guidance: getLocatabilityAdminGuidance({ stats }),
    })
  }

  async executeLocatabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_locatability_summary'
    },
  ) {
    this.assertCanManageLocatability(authContext)

    const payload = locatabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_locatability_summary': {
        const summary = await this.getWorkspaceLocatabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return locatabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed locatability summary with ${summary.stats.locatabilityPercent}% provider credential locatability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageLocatability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production locatability tools.',
    })
  }
}
