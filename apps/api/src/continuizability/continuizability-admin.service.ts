import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getContinuizabilityRolloutGuidance,
  continuizabilityAdminActionRequestSchema,
  continuizabilityAdminActionResponseSchema,
  continuizabilityAdminSummaryResponseSchema,
  continuizabilityCapabilitiesResponseSchema,
  continuizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildContinuizabilityAdminRecords,
  buildContinuizabilityAdminStats,
  getContinuizabilityAdminGuidance,
  resolveContinuizabilityAdminActions,
} from './continuizability-admin.helpers.js'
import { evaluateContinuizabilityRollout } from './continuizability-rollout.helpers.js'
import { ContinuizabilityStatusService } from './continuizability-status.service.js'

@Injectable()
export class ContinuizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly continuizabilityStatusService: ContinuizabilityStatusService,
  ) {}

  getCapabilities() {
    return continuizabilityCapabilitiesResponseSchema.parse({
      supportsContinuizabilityRollout: true,
      supportsContinuizabilityAdminTools: true,
      supportsProviderCredentialContinuizabilitySignals: true,
      supportsModelRegistryContinuizabilitySignals: true,
      guidance: getContinuizabilityRolloutGuidance(),
    })
  }

  async getContinuizabilityRollout() {
    const continuizabilityTableCoverage =
      await this.continuizabilityStatusService.getContinuizabilityTableCoverage()

    const rollout = evaluateContinuizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.continuizabilityStatusService.pingPostgres(),
      existingContinuizabilityTableCount: continuizabilityTableCoverage.existingContinuizabilityTableCount,
      workspaceProviderCredentialsTableExists: continuizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: continuizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: continuizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return continuizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceContinuizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageContinuizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.continuizabilityStatusService.getWorkspaceContinuizabilityInventory(
        workspaceId,
      )
    const records = buildContinuizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.continuizabilityStatusService.pingPostgres()
    const stats = buildContinuizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return continuizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveContinuizabilityAdminActions(),
      guidance: getContinuizabilityAdminGuidance({ stats }),
    })
  }

  async executeContinuizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_continuizability_summary'
    },
  ) {
    this.assertCanManageContinuizability(authContext)

    const payload = continuizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_continuizability_summary': {
        const summary = await this.getWorkspaceContinuizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return continuizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed continuizability summary with ${summary.stats.continuizabilityPercent}% provider credential continuizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageContinuizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production continuizability tools.',
    })
  }
}
