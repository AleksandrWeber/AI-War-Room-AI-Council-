import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDecentralizabilityRolloutGuidance,
  decentralizabilityAdminActionRequestSchema,
  decentralizabilityAdminActionResponseSchema,
  decentralizabilityAdminSummaryResponseSchema,
  decentralizabilityCapabilitiesResponseSchema,
  decentralizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDecentralizabilityAdminRecords,
  buildDecentralizabilityAdminStats,
  getDecentralizabilityAdminGuidance,
  resolveDecentralizabilityAdminActions,
} from './decentralizability-admin.helpers.js'
import { evaluateDecentralizabilityRollout } from './decentralizability-rollout.helpers.js'
import { DecentralizabilityStatusService } from './decentralizability-status.service.js'

@Injectable()
export class DecentralizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly decentralizabilityStatusService: DecentralizabilityStatusService,
  ) {}

  getCapabilities() {
    return decentralizabilityCapabilitiesResponseSchema.parse({
      supportsDecentralizabilityRollout: true,
      supportsDecentralizabilityAdminTools: true,
      supportsProviderCredentialDecentralizabilitySignals: true,
      supportsModelRegistryDecentralizabilitySignals: true,
      guidance: getDecentralizabilityRolloutGuidance(),
    })
  }

  async getDecentralizabilityRollout() {
    const decentralizabilityTableCoverage =
      await this.decentralizabilityStatusService.getDecentralizabilityTableCoverage()

    const rollout = evaluateDecentralizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.decentralizabilityStatusService.pingPostgres(),
      existingDecentralizabilityTableCount: decentralizabilityTableCoverage.existingDecentralizabilityTableCount,
      workspaceProviderCredentialsTableExists: decentralizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: decentralizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: decentralizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return decentralizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDecentralizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDecentralizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.decentralizabilityStatusService.getWorkspaceDecentralizabilityInventory(
        workspaceId,
      )
    const records = buildDecentralizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.decentralizabilityStatusService.pingPostgres()
    const stats = buildDecentralizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return decentralizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDecentralizabilityAdminActions(),
      guidance: getDecentralizabilityAdminGuidance({ stats }),
    })
  }

  async executeDecentralizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_decentralizability_summary'
    },
  ) {
    this.assertCanManageDecentralizability(authContext)

    const payload = decentralizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_decentralizability_summary': {
        const summary = await this.getWorkspaceDecentralizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return decentralizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed decentralizability summary with ${summary.stats.decentralizabilityPercent}% provider credential decentralizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDecentralizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production decentralizability tools.',
    })
  }
}
