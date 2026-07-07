import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSubstantiabilityvaultizabilityRolloutGuidance,
  substantiabilityvaultizabilityAdminActionRequestSchema,
  substantiabilityvaultizabilityAdminActionResponseSchema,
  substantiabilityvaultizabilityAdminSummaryResponseSchema,
  substantiabilityvaultizabilityCapabilitiesResponseSchema,
  substantiabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSubstantiabilityvaultizabilityAdminRecords,
  buildSubstantiabilityvaultizabilityAdminStats,
  getSubstantiabilityvaultizabilityAdminGuidance,
  resolveSubstantiabilityvaultizabilityAdminActions,
} from './substantiabilityvaultizability-admin.helpers.js'
import { evaluateSubstantiabilityvaultizabilityRollout } from './substantiabilityvaultizability-rollout.helpers.js'
import { SubstantiabilityvaultizabilityStatusService } from './substantiabilityvaultizability-status.service.js'

@Injectable()
export class SubstantiabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly substantiabilityvaultizabilityStatusService: SubstantiabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return substantiabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsSubstantiabilityvaultizabilityRollout: true,
      supportsSubstantiabilityvaultizabilityAdminTools: true,
      supportsShieldScanSubstantiabilityvaultizabilitySignals: true,
      supportsProviderCredentialSubstantiabilityvaultizabilitySignals: true,
      guidance: getSubstantiabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getSubstantiabilityvaultizabilityRollout() {
    const substantiabilityvaultizabilityTableCoverage =
      await this.substantiabilityvaultizabilityStatusService.getSubstantiabilityvaultizabilityTableCoverage()

    const rollout = evaluateSubstantiabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.substantiabilityvaultizabilityStatusService.pingPostgres(),
      existingSubstantiabilityvaultizabilityTableCount: substantiabilityvaultizabilityTableCoverage.existingSubstantiabilityvaultizabilityTableCount,
      shieldScansTableExists: substantiabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: substantiabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: substantiabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return substantiabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSubstantiabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSubstantiabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.substantiabilityvaultizabilityStatusService.getWorkspaceSubstantiabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildSubstantiabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.substantiabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildSubstantiabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return substantiabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSubstantiabilityvaultizabilityAdminActions(),
      guidance: getSubstantiabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeSubstantiabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_substantiabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageSubstantiabilityvaultizability(authContext)

    const payload = substantiabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_substantiabilityvaultizability_summary': {
        const summary = await this.getWorkspaceSubstantiabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return substantiabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed substantiabilityvaultizability summary with ${summary.stats.substantiabilityvaultizabilityPercent}% shield scan substantiabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSubstantiabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production substantiabilityvaultizability tools.',
    })
  }
}
