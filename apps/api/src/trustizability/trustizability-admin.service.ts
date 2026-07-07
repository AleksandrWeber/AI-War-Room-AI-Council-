import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTrustizabilityRolloutGuidance,
  trustizabilityAdminActionRequestSchema,
  trustizabilityAdminActionResponseSchema,
  trustizabilityAdminSummaryResponseSchema,
  trustizabilityCapabilitiesResponseSchema,
  trustizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTrustizabilityAdminRecords,
  buildTrustizabilityAdminStats,
  getTrustizabilityAdminGuidance,
  resolveTrustizabilityAdminActions,
} from './trustizability-admin.helpers.js'
import { evaluateTrustizabilityRollout } from './trustizability-rollout.helpers.js'
import { TrustizabilityStatusService } from './trustizability-status.service.js'

@Injectable()
export class TrustizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly trustizabilityStatusService: TrustizabilityStatusService,
  ) {}

  getCapabilities() {
    return trustizabilityCapabilitiesResponseSchema.parse({
      supportsTrustizabilityRollout: true,
      supportsTrustizabilityAdminTools: true,
      supportsShieldScanTrustizabilitySignals: true,
      supportsProviderCredentialTrustizabilitySignals: true,
      guidance: getTrustizabilityRolloutGuidance(),
    })
  }

  async getTrustizabilityRollout() {
    const trustizabilityTableCoverage =
      await this.trustizabilityStatusService.getTrustizabilityTableCoverage()

    const rollout = evaluateTrustizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.trustizabilityStatusService.pingPostgres(),
      existingTrustizabilityTableCount: trustizabilityTableCoverage.existingTrustizabilityTableCount,
      shieldScansTableExists: trustizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: trustizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: trustizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return trustizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTrustizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTrustizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.trustizabilityStatusService.getWorkspaceTrustizabilityInventory(
        workspaceId,
      )
    const records = buildTrustizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.trustizabilityStatusService.pingPostgres()
    const stats = buildTrustizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return trustizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTrustizabilityAdminActions(),
      guidance: getTrustizabilityAdminGuidance({ stats }),
    })
  }

  async executeTrustizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_trustizability_summary'
    },
  ) {
    this.assertCanManageTrustizability(authContext)

    const payload = trustizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_trustizability_summary': {
        const summary = await this.getWorkspaceTrustizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return trustizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed trustizability summary with ${summary.stats.trustizabilityPercent}% shield scan trustizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTrustizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production trustizability tools.',
    })
  }
}
