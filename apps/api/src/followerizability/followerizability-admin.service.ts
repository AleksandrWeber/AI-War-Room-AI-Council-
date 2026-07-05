import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFollowerizabilityRolloutGuidance,
  followerizabilityAdminActionRequestSchema,
  followerizabilityAdminActionResponseSchema,
  followerizabilityAdminSummaryResponseSchema,
  followerizabilityCapabilitiesResponseSchema,
  followerizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFollowerizabilityAdminRecords,
  buildFollowerizabilityAdminStats,
  getFollowerizabilityAdminGuidance,
  resolveFollowerizabilityAdminActions,
} from './followerizability-admin.helpers.js'
import { evaluateFollowerizabilityRollout } from './followerizability-rollout.helpers.js'
import { FollowerizabilityStatusService } from './followerizability-status.service.js'

@Injectable()
export class FollowerizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly followerizabilityStatusService: FollowerizabilityStatusService,
  ) {}

  getCapabilities() {
    return followerizabilityCapabilitiesResponseSchema.parse({
      supportsFollowerizabilityRollout: true,
      supportsFollowerizabilityAdminTools: true,
      supportsProviderCredentialFollowerizabilitySignals: true,
      supportsModelRegistryFollowerizabilitySignals: true,
      guidance: getFollowerizabilityRolloutGuidance(),
    })
  }

  async getFollowerizabilityRollout() {
    const followerizabilityTableCoverage =
      await this.followerizabilityStatusService.getFollowerizabilityTableCoverage()

    const rollout = evaluateFollowerizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.followerizabilityStatusService.pingPostgres(),
      existingFollowerizabilityTableCount: followerizabilityTableCoverage.existingFollowerizabilityTableCount,
      workspaceProviderCredentialsTableExists: followerizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: followerizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: followerizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return followerizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFollowerizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFollowerizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.followerizabilityStatusService.getWorkspaceFollowerizabilityInventory(
        workspaceId,
      )
    const records = buildFollowerizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.followerizabilityStatusService.pingPostgres()
    const stats = buildFollowerizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return followerizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFollowerizabilityAdminActions(),
      guidance: getFollowerizabilityAdminGuidance({ stats }),
    })
  }

  async executeFollowerizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_followerizability_summary'
    },
  ) {
    this.assertCanManageFollowerizability(authContext)

    const payload = followerizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_followerizability_summary': {
        const summary = await this.getWorkspaceFollowerizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return followerizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed followerizability summary with ${summary.stats.followerizabilityPercent}% provider credential followerizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFollowerizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production followerizability tools.',
    })
  }
}
