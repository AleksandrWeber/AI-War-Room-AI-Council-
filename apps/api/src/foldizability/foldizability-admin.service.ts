import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFoldizabilityRolloutGuidance,
  foldizabilityAdminActionRequestSchema,
  foldizabilityAdminActionResponseSchema,
  foldizabilityAdminSummaryResponseSchema,
  foldizabilityCapabilitiesResponseSchema,
  foldizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFoldizabilityAdminRecords,
  buildFoldizabilityAdminStats,
  getFoldizabilityAdminGuidance,
  resolveFoldizabilityAdminActions,
} from './foldizability-admin.helpers.js'
import { evaluateFoldizabilityRollout } from './foldizability-rollout.helpers.js'
import { FoldizabilityStatusService } from './foldizability-status.service.js'

@Injectable()
export class FoldizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly foldizabilityStatusService: FoldizabilityStatusService,
  ) {}

  getCapabilities() {
    return foldizabilityCapabilitiesResponseSchema.parse({
      supportsFoldizabilityRollout: true,
      supportsFoldizabilityAdminTools: true,
      supportsProviderCredentialFoldizabilitySignals: true,
      supportsModelRegistryFoldizabilitySignals: true,
      guidance: getFoldizabilityRolloutGuidance(),
    })
  }

  async getFoldizabilityRollout() {
    const foldizabilityTableCoverage =
      await this.foldizabilityStatusService.getFoldizabilityTableCoverage()

    const rollout = evaluateFoldizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.foldizabilityStatusService.pingPostgres(),
      existingFoldizabilityTableCount: foldizabilityTableCoverage.existingFoldizabilityTableCount,
      workspaceProviderCredentialsTableExists: foldizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: foldizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: foldizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return foldizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFoldizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFoldizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.foldizabilityStatusService.getWorkspaceFoldizabilityInventory(
        workspaceId,
      )
    const records = buildFoldizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.foldizabilityStatusService.pingPostgres()
    const stats = buildFoldizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return foldizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFoldizabilityAdminActions(),
      guidance: getFoldizabilityAdminGuidance({ stats }),
    })
  }

  async executeFoldizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_foldizability_summary'
    },
  ) {
    this.assertCanManageFoldizability(authContext)

    const payload = foldizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_foldizability_summary': {
        const summary = await this.getWorkspaceFoldizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return foldizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed foldizability summary with ${summary.stats.foldizabilityPercent}% provider credential foldizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFoldizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production foldizability tools.',
    })
  }
}
