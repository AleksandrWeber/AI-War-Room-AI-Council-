import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPaginizabilityRolloutGuidance,
  paginizabilityAdminActionRequestSchema,
  paginizabilityAdminActionResponseSchema,
  paginizabilityAdminSummaryResponseSchema,
  paginizabilityCapabilitiesResponseSchema,
  paginizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPaginizabilityAdminRecords,
  buildPaginizabilityAdminStats,
  getPaginizabilityAdminGuidance,
  resolvePaginizabilityAdminActions,
} from './paginizability-admin.helpers.js'
import { evaluatePaginizabilityRollout } from './paginizability-rollout.helpers.js'
import { PaginizabilityStatusService } from './paginizability-status.service.js'

@Injectable()
export class PaginizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly paginizabilityStatusService: PaginizabilityStatusService,
  ) {}

  getCapabilities() {
    return paginizabilityCapabilitiesResponseSchema.parse({
      supportsPaginizabilityRollout: true,
      supportsPaginizabilityAdminTools: true,
      supportsProviderCredentialPaginizabilitySignals: true,
      supportsModelRegistryPaginizabilitySignals: true,
      guidance: getPaginizabilityRolloutGuidance(),
    })
  }

  async getPaginizabilityRollout() {
    const paginizabilityTableCoverage =
      await this.paginizabilityStatusService.getPaginizabilityTableCoverage()

    const rollout = evaluatePaginizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.paginizabilityStatusService.pingPostgres(),
      existingPaginizabilityTableCount: paginizabilityTableCoverage.existingPaginizabilityTableCount,
      workspaceProviderCredentialsTableExists: paginizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: paginizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: paginizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return paginizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePaginizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePaginizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.paginizabilityStatusService.getWorkspacePaginizabilityInventory(
        workspaceId,
      )
    const records = buildPaginizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.paginizabilityStatusService.pingPostgres()
    const stats = buildPaginizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return paginizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePaginizabilityAdminActions(),
      guidance: getPaginizabilityAdminGuidance({ stats }),
    })
  }

  async executePaginizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_paginizability_summary'
    },
  ) {
    this.assertCanManagePaginizability(authContext)

    const payload = paginizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_paginizability_summary': {
        const summary = await this.getWorkspacePaginizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return paginizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed paginizability summary with ${summary.stats.paginizabilityPercent}% provider credential paginizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePaginizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production paginizability tools.',
    })
  }
}
