import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIllustratabilityRolloutGuidance,
  illustratabilityAdminActionRequestSchema,
  illustratabilityAdminActionResponseSchema,
  illustratabilityAdminSummaryResponseSchema,
  illustratabilityCapabilitiesResponseSchema,
  illustratabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIllustratabilityAdminRecords,
  buildIllustratabilityAdminStats,
  getIllustratabilityAdminGuidance,
  resolveIllustratabilityAdminActions,
} from './illustratability-admin.helpers.js'
import { evaluateIllustratabilityRollout } from './illustratability-rollout.helpers.js'
import { IllustratabilityStatusService } from './illustratability-status.service.js'

@Injectable()
export class IllustratabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly illustratabilityStatusService: IllustratabilityStatusService,
  ) {}

  getCapabilities() {
    return illustratabilityCapabilitiesResponseSchema.parse({
      supportsIllustratabilityRollout: true,
      supportsIllustratabilityAdminTools: true,
      supportsShieldScanIllustratabilitySignals: true,
      supportsProviderCredentialIllustratabilitySignals: true,
      guidance: getIllustratabilityRolloutGuidance(),
    })
  }

  async getIllustratabilityRollout() {
    const illustratabilityTableCoverage =
      await this.illustratabilityStatusService.getIllustratabilityTableCoverage()

    const rollout = evaluateIllustratabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.illustratabilityStatusService.pingPostgres(),
      existingIllustratabilityTableCount: illustratabilityTableCoverage.existingIllustratabilityTableCount,
      shieldScansTableExists: illustratabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: illustratabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: illustratabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return illustratabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIllustratabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIllustratability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.illustratabilityStatusService.getWorkspaceIllustratabilityInventory(
        workspaceId,
      )
    const records = buildIllustratabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.illustratabilityStatusService.pingPostgres()
    const stats = buildIllustratabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return illustratabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIllustratabilityAdminActions(),
      guidance: getIllustratabilityAdminGuidance({ stats }),
    })
  }

  async executeIllustratabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_illustratability_summary'
    },
  ) {
    this.assertCanManageIllustratability(authContext)

    const payload = illustratabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_illustratability_summary': {
        const summary = await this.getWorkspaceIllustratabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return illustratabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed illustratability summary with ${summary.stats.illustratabilityPercent}% shield scan illustratability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIllustratability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production illustratability tools.',
    })
  }
}
