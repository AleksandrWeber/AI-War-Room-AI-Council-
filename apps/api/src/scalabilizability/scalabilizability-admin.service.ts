import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getScalabilizabilityRolloutGuidance,
  scalabilizabilityAdminActionRequestSchema,
  scalabilizabilityAdminActionResponseSchema,
  scalabilizabilityAdminSummaryResponseSchema,
  scalabilizabilityCapabilitiesResponseSchema,
  scalabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildScalabilizabilityAdminRecords,
  buildScalabilizabilityAdminStats,
  getScalabilizabilityAdminGuidance,
  resolveScalabilizabilityAdminActions,
} from './scalabilizability-admin.helpers.js'
import { evaluateScalabilizabilityRollout } from './scalabilizability-rollout.helpers.js'
import { ScalabilizabilityStatusService } from './scalabilizability-status.service.js'

@Injectable()
export class ScalabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly scalabilizabilityStatusService: ScalabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return scalabilizabilityCapabilitiesResponseSchema.parse({
      supportsScalabilizabilityRollout: true,
      supportsScalabilizabilityAdminTools: true,
      supportsShieldScanScalabilizabilitySignals: true,
      supportsProviderCredentialScalabilizabilitySignals: true,
      guidance: getScalabilizabilityRolloutGuidance(),
    })
  }

  async getScalabilizabilityRollout() {
    const scalabilizabilityTableCoverage =
      await this.scalabilizabilityStatusService.getScalabilizabilityTableCoverage()

    const rollout = evaluateScalabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.scalabilizabilityStatusService.pingPostgres(),
      existingScalabilizabilityTableCount: scalabilizabilityTableCoverage.existingScalabilizabilityTableCount,
      shieldScansTableExists: scalabilizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: scalabilizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: scalabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return scalabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceScalabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageScalabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.scalabilizabilityStatusService.getWorkspaceScalabilizabilityInventory(
        workspaceId,
      )
    const records = buildScalabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.scalabilizabilityStatusService.pingPostgres()
    const stats = buildScalabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return scalabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveScalabilizabilityAdminActions(),
      guidance: getScalabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeScalabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_scalabilizability_summary'
    },
  ) {
    this.assertCanManageScalabilizability(authContext)

    const payload = scalabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_scalabilizability_summary': {
        const summary = await this.getWorkspaceScalabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return scalabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed scalabilizability summary with ${summary.stats.scalabilizabilityPercent}% shield scan scalabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageScalabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production scalabilizability tools.',
    })
  }
}
