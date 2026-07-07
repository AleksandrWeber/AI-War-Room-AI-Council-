import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTunabilityvaultizabilityRolloutGuidance,
  tunabilityvaultizabilityAdminActionRequestSchema,
  tunabilityvaultizabilityAdminActionResponseSchema,
  tunabilityvaultizabilityAdminSummaryResponseSchema,
  tunabilityvaultizabilityCapabilitiesResponseSchema,
  tunabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTunabilityvaultizabilityAdminRecords,
  buildTunabilityvaultizabilityAdminStats,
  getTunabilityvaultizabilityAdminGuidance,
  resolveTunabilityvaultizabilityAdminActions,
} from './tunabilityvaultizability-admin.helpers.js'
import { evaluateTunabilityvaultizabilityRollout } from './tunabilityvaultizability-rollout.helpers.js'
import { TunabilityvaultizabilityStatusService } from './tunabilityvaultizability-status.service.js'

@Injectable()
export class TunabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly tunabilityvaultizabilityStatusService: TunabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return tunabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsTunabilityvaultizabilityRollout: true,
      supportsTunabilityvaultizabilityAdminTools: true,
      supportsShieldScanTunabilityvaultizabilitySignals: true,
      supportsProviderCredentialTunabilityvaultizabilitySignals: true,
      guidance: getTunabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getTunabilityvaultizabilityRollout() {
    const tunabilityvaultizabilityTableCoverage =
      await this.tunabilityvaultizabilityStatusService.getTunabilityvaultizabilityTableCoverage()

    const rollout = evaluateTunabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.tunabilityvaultizabilityStatusService.pingPostgres(),
      existingTunabilityvaultizabilityTableCount: tunabilityvaultizabilityTableCoverage.existingTunabilityvaultizabilityTableCount,
      shieldScansTableExists: tunabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: tunabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: tunabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return tunabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTunabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTunabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.tunabilityvaultizabilityStatusService.getWorkspaceTunabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildTunabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.tunabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildTunabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return tunabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTunabilityvaultizabilityAdminActions(),
      guidance: getTunabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeTunabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_tunabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageTunabilityvaultizability(authContext)

    const payload = tunabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_tunabilityvaultizability_summary': {
        const summary = await this.getWorkspaceTunabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return tunabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed tunabilityvaultizability summary with ${summary.stats.tunabilityvaultizabilityPercent}% shield scan tunabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTunabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production tunabilityvaultizability tools.',
    })
  }
}
