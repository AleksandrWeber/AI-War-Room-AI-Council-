import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getComposabilityvaultizabilityRolloutGuidance,
  composabilityvaultizabilityAdminActionRequestSchema,
  composabilityvaultizabilityAdminActionResponseSchema,
  composabilityvaultizabilityAdminSummaryResponseSchema,
  composabilityvaultizabilityCapabilitiesResponseSchema,
  composabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComposabilityvaultizabilityAdminRecords,
  buildComposabilityvaultizabilityAdminStats,
  getComposabilityvaultizabilityAdminGuidance,
  resolveComposabilityvaultizabilityAdminActions,
} from './composabilityvaultizability-admin.helpers.js'
import { evaluateComposabilityvaultizabilityRollout } from './composabilityvaultizability-rollout.helpers.js'
import { ComposabilityvaultizabilityStatusService } from './composabilityvaultizability-status.service.js'

@Injectable()
export class ComposabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly composabilityvaultizabilityStatusService: ComposabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return composabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsComposabilityvaultizabilityRollout: true,
      supportsComposabilityvaultizabilityAdminTools: true,
      supportsShieldScanComposabilityvaultizabilitySignals: true,
      supportsProviderCredentialComposabilityvaultizabilitySignals: true,
      guidance: getComposabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getComposabilityvaultizabilityRollout() {
    const composabilityvaultizabilityTableCoverage =
      await this.composabilityvaultizabilityStatusService.getComposabilityvaultizabilityTableCoverage()

    const rollout = evaluateComposabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.composabilityvaultizabilityStatusService.pingPostgres(),
      existingComposabilityvaultizabilityTableCount: composabilityvaultizabilityTableCoverage.existingComposabilityvaultizabilityTableCount,
      shieldScansTableExists: composabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: composabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: composabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return composabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComposabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageComposabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.composabilityvaultizabilityStatusService.getWorkspaceComposabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildComposabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.composabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildComposabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return composabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComposabilityvaultizabilityAdminActions(),
      guidance: getComposabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeComposabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_composabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageComposabilityvaultizability(authContext)

    const payload = composabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_composabilityvaultizability_summary': {
        const summary = await this.getWorkspaceComposabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return composabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed composabilityvaultizability summary with ${summary.stats.composabilityvaultizabilityPercent}% shield scan composabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageComposabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production composabilityvaultizability tools.',
    })
  }
}
