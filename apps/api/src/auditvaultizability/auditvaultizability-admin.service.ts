import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditvaultizabilityRolloutGuidance,
  auditvaultizabilityAdminActionRequestSchema,
  auditvaultizabilityAdminActionResponseSchema,
  auditvaultizabilityAdminSummaryResponseSchema,
  auditvaultizabilityCapabilitiesResponseSchema,
  auditvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditvaultizabilityAdminRecords,
  buildAuditvaultizabilityAdminStats,
  getAuditvaultizabilityAdminGuidance,
  resolveAuditvaultizabilityAdminActions,
} from './auditvaultizability-admin.helpers.js'
import { evaluateAuditvaultizabilityRollout } from './auditvaultizability-rollout.helpers.js'
import { AuditvaultizabilityStatusService } from './auditvaultizability-status.service.js'

@Injectable()
export class AuditvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditvaultizabilityStatusService: AuditvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return auditvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAuditvaultizabilityRollout: true,
      supportsAuditvaultizabilityAdminTools: true,
      supportsShieldScanAuditvaultizabilitySignals: true,
      supportsProviderCredentialAuditvaultizabilitySignals: true,
      guidance: getAuditvaultizabilityRolloutGuidance(),
    })
  }

  async getAuditvaultizabilityRollout() {
    const auditvaultizabilityTableCoverage =
      await this.auditvaultizabilityStatusService.getAuditvaultizabilityTableCoverage()

    const rollout = evaluateAuditvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditvaultizabilityStatusService.pingPostgres(),
      existingAuditvaultizabilityTableCount: auditvaultizabilityTableCoverage.existingAuditvaultizabilityTableCount,
      shieldScansTableExists: auditvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: auditvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: auditvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return auditvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditvaultizabilityStatusService.getWorkspaceAuditvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAuditvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditvaultizabilityStatusService.pingPostgres()
    const stats = buildAuditvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditvaultizabilityAdminActions(),
      guidance: getAuditvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditvaultizability_summary'
    },
  ) {
    this.assertCanManageAuditvaultizability(authContext)

    const payload = auditvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditvaultizability_summary': {
        const summary = await this.getWorkspaceAuditvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditvaultizability summary with ${summary.stats.auditvaultizabilityPercent}% shield scan auditvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditvaultizability tools.',
    })
  }
}
