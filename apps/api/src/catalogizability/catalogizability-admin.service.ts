import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCatalogizabilityRolloutGuidance,
  catalogizabilityAdminActionRequestSchema,
  catalogizabilityAdminActionResponseSchema,
  catalogizabilityAdminSummaryResponseSchema,
  catalogizabilityCapabilitiesResponseSchema,
  catalogizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCatalogizabilityAdminRecords,
  buildCatalogizabilityAdminStats,
  getCatalogizabilityAdminGuidance,
  resolveCatalogizabilityAdminActions,
} from './catalogizability-admin.helpers.js'
import { evaluateCatalogizabilityRollout } from './catalogizability-rollout.helpers.js'
import { CatalogizabilityStatusService } from './catalogizability-status.service.js'

@Injectable()
export class CatalogizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly catalogizabilityStatusService: CatalogizabilityStatusService,
  ) {}

  getCapabilities() {
    return catalogizabilityCapabilitiesResponseSchema.parse({
      supportsCatalogizabilityRollout: true,
      supportsCatalogizabilityAdminTools: true,
      supportsShieldScanCatalogizabilitySignals: true,
      supportsProviderCredentialCatalogizabilitySignals: true,
      guidance: getCatalogizabilityRolloutGuidance(),
    })
  }

  async getCatalogizabilityRollout() {
    const catalogizabilityTableCoverage =
      await this.catalogizabilityStatusService.getCatalogizabilityTableCoverage()

    const rollout = evaluateCatalogizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.catalogizabilityStatusService.pingPostgres(),
      existingCatalogizabilityTableCount: catalogizabilityTableCoverage.existingCatalogizabilityTableCount,
      shieldScansTableExists: catalogizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: catalogizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: catalogizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return catalogizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCatalogizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCatalogizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.catalogizabilityStatusService.getWorkspaceCatalogizabilityInventory(
        workspaceId,
      )
    const records = buildCatalogizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.catalogizabilityStatusService.pingPostgres()
    const stats = buildCatalogizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return catalogizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCatalogizabilityAdminActions(),
      guidance: getCatalogizabilityAdminGuidance({ stats }),
    })
  }

  async executeCatalogizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_catalogizability_summary'
    },
  ) {
    this.assertCanManageCatalogizability(authContext)

    const payload = catalogizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_catalogizability_summary': {
        const summary = await this.getWorkspaceCatalogizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return catalogizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed catalogizability summary with ${summary.stats.catalogizabilityPercent}% shield scan catalogizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCatalogizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production catalogizability tools.',
    })
  }
}
