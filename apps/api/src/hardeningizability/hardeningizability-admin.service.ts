import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHardeningizabilityRolloutGuidance,
  hardeningizabilityAdminActionRequestSchema,
  hardeningizabilityAdminActionResponseSchema,
  hardeningizabilityAdminSummaryResponseSchema,
  hardeningizabilityCapabilitiesResponseSchema,
  hardeningizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHardeningizabilityAdminRecords,
  buildHardeningizabilityAdminStats,
  getHardeningizabilityAdminGuidance,
  resolveHardeningizabilityAdminActions,
} from './hardeningizability-admin.helpers.js'
import { evaluateHardeningizabilityRollout } from './hardeningizability-rollout.helpers.js'
import { HardeningizabilityStatusService } from './hardeningizability-status.service.js'

@Injectable()
export class HardeningizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly hardeningizabilityStatusService: HardeningizabilityStatusService,
  ) {}

  getCapabilities() {
    return hardeningizabilityCapabilitiesResponseSchema.parse({
      supportsHardeningizabilityRollout: true,
      supportsHardeningizabilityAdminTools: true,
      supportsShieldScanHardeningizabilitySignals: true,
      supportsProviderCredentialHardeningizabilitySignals: true,
      guidance: getHardeningizabilityRolloutGuidance(),
    })
  }

  async getHardeningizabilityRollout() {
    const hardeningizabilityTableCoverage =
      await this.hardeningizabilityStatusService.getHardeningizabilityTableCoverage()

    const rollout = evaluateHardeningizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.hardeningizabilityStatusService.pingPostgres(),
      existingHardeningizabilityTableCount: hardeningizabilityTableCoverage.existingHardeningizabilityTableCount,
      shieldScansTableExists: hardeningizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: hardeningizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: hardeningizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return hardeningizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHardeningizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHardeningizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.hardeningizabilityStatusService.getWorkspaceHardeningizabilityInventory(
        workspaceId,
      )
    const records = buildHardeningizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.hardeningizabilityStatusService.pingPostgres()
    const stats = buildHardeningizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return hardeningizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHardeningizabilityAdminActions(),
      guidance: getHardeningizabilityAdminGuidance({ stats }),
    })
  }

  async executeHardeningizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_hardeningizability_summary'
    },
  ) {
    this.assertCanManageHardeningizability(authContext)

    const payload = hardeningizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_hardeningizability_summary': {
        const summary = await this.getWorkspaceHardeningizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return hardeningizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed hardeningizability summary with ${summary.stats.hardeningizabilityPercent}% shield scan hardeningizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHardeningizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production hardeningizability tools.',
    })
  }
}
