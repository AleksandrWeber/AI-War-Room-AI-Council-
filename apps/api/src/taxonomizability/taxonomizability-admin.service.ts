import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTaxonomizabilityRolloutGuidance,
  taxonomizabilityAdminActionRequestSchema,
  taxonomizabilityAdminActionResponseSchema,
  taxonomizabilityAdminSummaryResponseSchema,
  taxonomizabilityCapabilitiesResponseSchema,
  taxonomizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTaxonomizabilityAdminRecords,
  buildTaxonomizabilityAdminStats,
  getTaxonomizabilityAdminGuidance,
  resolveTaxonomizabilityAdminActions,
} from './taxonomizability-admin.helpers.js'
import { evaluateTaxonomizabilityRollout } from './taxonomizability-rollout.helpers.js'
import { TaxonomizabilityStatusService } from './taxonomizability-status.service.js'

@Injectable()
export class TaxonomizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly taxonomizabilityStatusService: TaxonomizabilityStatusService,
  ) {}

  getCapabilities() {
    return taxonomizabilityCapabilitiesResponseSchema.parse({
      supportsTaxonomizabilityRollout: true,
      supportsTaxonomizabilityAdminTools: true,
      supportsShieldScanTaxonomizabilitySignals: true,
      supportsProviderCredentialTaxonomizabilitySignals: true,
      guidance: getTaxonomizabilityRolloutGuidance(),
    })
  }

  async getTaxonomizabilityRollout() {
    const taxonomizabilityTableCoverage =
      await this.taxonomizabilityStatusService.getTaxonomizabilityTableCoverage()

    const rollout = evaluateTaxonomizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.taxonomizabilityStatusService.pingPostgres(),
      existingTaxonomizabilityTableCount: taxonomizabilityTableCoverage.existingTaxonomizabilityTableCount,
      shieldScansTableExists: taxonomizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: taxonomizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: taxonomizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return taxonomizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTaxonomizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTaxonomizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.taxonomizabilityStatusService.getWorkspaceTaxonomizabilityInventory(
        workspaceId,
      )
    const records = buildTaxonomizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.taxonomizabilityStatusService.pingPostgres()
    const stats = buildTaxonomizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return taxonomizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTaxonomizabilityAdminActions(),
      guidance: getTaxonomizabilityAdminGuidance({ stats }),
    })
  }

  async executeTaxonomizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_taxonomizability_summary'
    },
  ) {
    this.assertCanManageTaxonomizability(authContext)

    const payload = taxonomizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_taxonomizability_summary': {
        const summary = await this.getWorkspaceTaxonomizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return taxonomizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed taxonomizability summary with ${summary.stats.taxonomizabilityPercent}% shield scan taxonomizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTaxonomizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production taxonomizability tools.',
    })
  }
}
