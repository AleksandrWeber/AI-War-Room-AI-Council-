import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPropagationizabilityRolloutGuidance,
  propagationizabilityAdminActionRequestSchema,
  propagationizabilityAdminActionResponseSchema,
  propagationizabilityAdminSummaryResponseSchema,
  propagationizabilityCapabilitiesResponseSchema,
  propagationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPropagationizabilityAdminRecords,
  buildPropagationizabilityAdminStats,
  getPropagationizabilityAdminGuidance,
  resolvePropagationizabilityAdminActions,
} from './propagationizability-admin.helpers.js'
import { evaluatePropagationizabilityRollout } from './propagationizability-rollout.helpers.js'
import { PropagationizabilityStatusService } from './propagationizability-status.service.js'

@Injectable()
export class PropagationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly propagationizabilityStatusService: PropagationizabilityStatusService,
  ) {}

  getCapabilities() {
    return propagationizabilityCapabilitiesResponseSchema.parse({
      supportsPropagationizabilityRollout: true,
      supportsPropagationizabilityAdminTools: true,
      supportsProviderCredentialPropagationizabilitySignals: true,
      supportsModelRegistryPropagationizabilitySignals: true,
      guidance: getPropagationizabilityRolloutGuidance(),
    })
  }

  async getPropagationizabilityRollout() {
    const propagationizabilityTableCoverage =
      await this.propagationizabilityStatusService.getPropagationizabilityTableCoverage()

    const rollout = evaluatePropagationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.propagationizabilityStatusService.pingPostgres(),
      existingPropagationizabilityTableCount: propagationizabilityTableCoverage.existingPropagationizabilityTableCount,
      workspaceProviderCredentialsTableExists: propagationizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: propagationizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: propagationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return propagationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePropagationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePropagationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.propagationizabilityStatusService.getWorkspacePropagationizabilityInventory(
        workspaceId,
      )
    const records = buildPropagationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.propagationizabilityStatusService.pingPostgres()
    const stats = buildPropagationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return propagationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePropagationizabilityAdminActions(),
      guidance: getPropagationizabilityAdminGuidance({ stats }),
    })
  }

  async executePropagationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_propagationizability_summary'
    },
  ) {
    this.assertCanManagePropagationizability(authContext)

    const payload = propagationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_propagationizability_summary': {
        const summary = await this.getWorkspacePropagationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return propagationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed propagationizability summary with ${summary.stats.propagationizabilityPercent}% provider credential propagationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePropagationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production propagationizability tools.',
    })
  }
}
