import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getEpistemizabilityRolloutGuidance,
  epistemizabilityAdminActionRequestSchema,
  epistemizabilityAdminActionResponseSchema,
  epistemizabilityAdminSummaryResponseSchema,
  epistemizabilityCapabilitiesResponseSchema,
  epistemizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildEpistemizabilityAdminRecords,
  buildEpistemizabilityAdminStats,
  getEpistemizabilityAdminGuidance,
  resolveEpistemizabilityAdminActions,
} from './epistemizability-admin.helpers.js'
import { evaluateEpistemizabilityRollout } from './epistemizability-rollout.helpers.js'
import { EpistemizabilityStatusService } from './epistemizability-status.service.js'

@Injectable()
export class EpistemizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly epistemizabilityStatusService: EpistemizabilityStatusService,
  ) {}

  getCapabilities() {
    return epistemizabilityCapabilitiesResponseSchema.parse({
      supportsEpistemizabilityRollout: true,
      supportsEpistemizabilityAdminTools: true,
      supportsShieldScanEpistemizabilitySignals: true,
      supportsProviderCredentialEpistemizabilitySignals: true,
      guidance: getEpistemizabilityRolloutGuidance(),
    })
  }

  async getEpistemizabilityRollout() {
    const epistemizabilityTableCoverage =
      await this.epistemizabilityStatusService.getEpistemizabilityTableCoverage()

    const rollout = evaluateEpistemizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.epistemizabilityStatusService.pingPostgres(),
      existingEpistemizabilityTableCount: epistemizabilityTableCoverage.existingEpistemizabilityTableCount,
      shieldScansTableExists: epistemizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: epistemizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: epistemizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return epistemizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceEpistemizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageEpistemizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.epistemizabilityStatusService.getWorkspaceEpistemizabilityInventory(
        workspaceId,
      )
    const records = buildEpistemizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.epistemizabilityStatusService.pingPostgres()
    const stats = buildEpistemizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return epistemizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveEpistemizabilityAdminActions(),
      guidance: getEpistemizabilityAdminGuidance({ stats }),
    })
  }

  async executeEpistemizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_epistemizability_summary'
    },
  ) {
    this.assertCanManageEpistemizability(authContext)

    const payload = epistemizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_epistemizability_summary': {
        const summary = await this.getWorkspaceEpistemizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return epistemizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed epistemizability summary with ${summary.stats.epistemizabilityPercent}% shield scan epistemizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageEpistemizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production epistemizability tools.',
    })
  }
}
