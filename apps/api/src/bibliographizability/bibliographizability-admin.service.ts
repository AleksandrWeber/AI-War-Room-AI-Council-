import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getBibliographizabilityRolloutGuidance,
  bibliographizabilityAdminActionRequestSchema,
  bibliographizabilityAdminActionResponseSchema,
  bibliographizabilityAdminSummaryResponseSchema,
  bibliographizabilityCapabilitiesResponseSchema,
  bibliographizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildBibliographizabilityAdminRecords,
  buildBibliographizabilityAdminStats,
  getBibliographizabilityAdminGuidance,
  resolveBibliographizabilityAdminActions,
} from './bibliographizability-admin.helpers.js'
import { evaluateBibliographizabilityRollout } from './bibliographizability-rollout.helpers.js'
import { BibliographizabilityStatusService } from './bibliographizability-status.service.js'

@Injectable()
export class BibliographizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly bibliographizabilityStatusService: BibliographizabilityStatusService,
  ) {}

  getCapabilities() {
    return bibliographizabilityCapabilitiesResponseSchema.parse({
      supportsBibliographizabilityRollout: true,
      supportsBibliographizabilityAdminTools: true,
      supportsShieldScanBibliographizabilitySignals: true,
      supportsProviderCredentialBibliographizabilitySignals: true,
      guidance: getBibliographizabilityRolloutGuidance(),
    })
  }

  async getBibliographizabilityRollout() {
    const bibliographizabilityTableCoverage =
      await this.bibliographizabilityStatusService.getBibliographizabilityTableCoverage()

    const rollout = evaluateBibliographizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.bibliographizabilityStatusService.pingPostgres(),
      existingBibliographizabilityTableCount: bibliographizabilityTableCoverage.existingBibliographizabilityTableCount,
      shieldScansTableExists: bibliographizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: bibliographizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: bibliographizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return bibliographizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceBibliographizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageBibliographizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.bibliographizabilityStatusService.getWorkspaceBibliographizabilityInventory(
        workspaceId,
      )
    const records = buildBibliographizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.bibliographizabilityStatusService.pingPostgres()
    const stats = buildBibliographizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return bibliographizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveBibliographizabilityAdminActions(),
      guidance: getBibliographizabilityAdminGuidance({ stats }),
    })
  }

  async executeBibliographizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_bibliographizability_summary'
    },
  ) {
    this.assertCanManageBibliographizability(authContext)

    const payload = bibliographizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_bibliographizability_summary': {
        const summary = await this.getWorkspaceBibliographizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return bibliographizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed bibliographizability summary with ${summary.stats.bibliographizabilityPercent}% shield scan bibliographizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageBibliographizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production bibliographizability tools.',
    })
  }
}
