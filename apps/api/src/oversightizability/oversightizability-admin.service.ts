import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOversightizabilityRolloutGuidance,
  oversightizabilityAdminActionRequestSchema,
  oversightizabilityAdminActionResponseSchema,
  oversightizabilityAdminSummaryResponseSchema,
  oversightizabilityCapabilitiesResponseSchema,
  oversightizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOversightizabilityAdminRecords,
  buildOversightizabilityAdminStats,
  getOversightizabilityAdminGuidance,
  resolveOversightizabilityAdminActions,
} from './oversightizability-admin.helpers.js'
import { evaluateOversightizabilityRollout } from './oversightizability-rollout.helpers.js'
import { OversightizabilityStatusService } from './oversightizability-status.service.js'

@Injectable()
export class OversightizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly oversightizabilityStatusService: OversightizabilityStatusService,
  ) {}

  getCapabilities() {
    return oversightizabilityCapabilitiesResponseSchema.parse({
      supportsOversightizabilityRollout: true,
      supportsOversightizabilityAdminTools: true,
      supportsShieldScanOversightizabilitySignals: true,
      supportsProviderCredentialOversightizabilitySignals: true,
      guidance: getOversightizabilityRolloutGuidance(),
    })
  }

  async getOversightizabilityRollout() {
    const oversightizabilityTableCoverage =
      await this.oversightizabilityStatusService.getOversightizabilityTableCoverage()

    const rollout = evaluateOversightizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.oversightizabilityStatusService.pingPostgres(),
      existingOversightizabilityTableCount: oversightizabilityTableCoverage.existingOversightizabilityTableCount,
      shieldScansTableExists: oversightizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: oversightizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: oversightizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return oversightizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOversightizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOversightizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.oversightizabilityStatusService.getWorkspaceOversightizabilityInventory(
        workspaceId,
      )
    const records = buildOversightizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.oversightizabilityStatusService.pingPostgres()
    const stats = buildOversightizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return oversightizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOversightizabilityAdminActions(),
      guidance: getOversightizabilityAdminGuidance({ stats }),
    })
  }

  async executeOversightizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_oversightizability_summary'
    },
  ) {
    this.assertCanManageOversightizability(authContext)

    const payload = oversightizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_oversightizability_summary': {
        const summary = await this.getWorkspaceOversightizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return oversightizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed oversightizability summary with ${summary.stats.oversightizabilityPercent}% shield scan oversightizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOversightizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production oversightizability tools.',
    })
  }
}
