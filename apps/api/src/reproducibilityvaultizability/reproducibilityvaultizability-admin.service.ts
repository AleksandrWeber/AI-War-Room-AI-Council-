import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReproducibilityvaultizabilityRolloutGuidance,
  reproducibilityvaultizabilityAdminActionRequestSchema,
  reproducibilityvaultizabilityAdminActionResponseSchema,
  reproducibilityvaultizabilityAdminSummaryResponseSchema,
  reproducibilityvaultizabilityCapabilitiesResponseSchema,
  reproducibilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReproducibilityvaultizabilityAdminRecords,
  buildReproducibilityvaultizabilityAdminStats,
  getReproducibilityvaultizabilityAdminGuidance,
  resolveReproducibilityvaultizabilityAdminActions,
} from './reproducibilityvaultizability-admin.helpers.js'
import { evaluateReproducibilityvaultizabilityRollout } from './reproducibilityvaultizability-rollout.helpers.js'
import { ReproducibilityvaultizabilityStatusService } from './reproducibilityvaultizability-status.service.js'

@Injectable()
export class ReproducibilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly reproducibilityvaultizabilityStatusService: ReproducibilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return reproducibilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsReproducibilityvaultizabilityRollout: true,
      supportsReproducibilityvaultizabilityAdminTools: true,
      supportsShieldScanReproducibilityvaultizabilitySignals: true,
      supportsProviderCredentialReproducibilityvaultizabilitySignals: true,
      guidance: getReproducibilityvaultizabilityRolloutGuidance(),
    })
  }

  async getReproducibilityvaultizabilityRollout() {
    const reproducibilityvaultizabilityTableCoverage =
      await this.reproducibilityvaultizabilityStatusService.getReproducibilityvaultizabilityTableCoverage()

    const rollout = evaluateReproducibilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.reproducibilityvaultizabilityStatusService.pingPostgres(),
      existingReproducibilityvaultizabilityTableCount: reproducibilityvaultizabilityTableCoverage.existingReproducibilityvaultizabilityTableCount,
      shieldScansTableExists: reproducibilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: reproducibilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: reproducibilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return reproducibilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReproducibilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReproducibilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.reproducibilityvaultizabilityStatusService.getWorkspaceReproducibilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildReproducibilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.reproducibilityvaultizabilityStatusService.pingPostgres()
    const stats = buildReproducibilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return reproducibilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReproducibilityvaultizabilityAdminActions(),
      guidance: getReproducibilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeReproducibilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_reproducibilityvaultizability_summary'
    },
  ) {
    this.assertCanManageReproducibilityvaultizability(authContext)

    const payload = reproducibilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_reproducibilityvaultizability_summary': {
        const summary = await this.getWorkspaceReproducibilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return reproducibilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed reproducibilityvaultizability summary with ${summary.stats.reproducibilityvaultizabilityPercent}% shield scan reproducibilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReproducibilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production reproducibilityvaultizability tools.',
    })
  }
}
