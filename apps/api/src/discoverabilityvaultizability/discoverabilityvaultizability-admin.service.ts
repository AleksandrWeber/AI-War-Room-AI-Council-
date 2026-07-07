import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDiscoverabilityvaultizabilityRolloutGuidance,
  discoverabilityvaultizabilityAdminActionRequestSchema,
  discoverabilityvaultizabilityAdminActionResponseSchema,
  discoverabilityvaultizabilityAdminSummaryResponseSchema,
  discoverabilityvaultizabilityCapabilitiesResponseSchema,
  discoverabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDiscoverabilityvaultizabilityAdminRecords,
  buildDiscoverabilityvaultizabilityAdminStats,
  getDiscoverabilityvaultizabilityAdminGuidance,
  resolveDiscoverabilityvaultizabilityAdminActions,
} from './discoverabilityvaultizability-admin.helpers.js'
import { evaluateDiscoverabilityvaultizabilityRollout } from './discoverabilityvaultizability-rollout.helpers.js'
import { DiscoverabilityvaultizabilityStatusService } from './discoverabilityvaultizability-status.service.js'

@Injectable()
export class DiscoverabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly discoverabilityvaultizabilityStatusService: DiscoverabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return discoverabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsDiscoverabilityvaultizabilityRollout: true,
      supportsDiscoverabilityvaultizabilityAdminTools: true,
      supportsShieldScanDiscoverabilityvaultizabilitySignals: true,
      supportsProviderCredentialDiscoverabilityvaultizabilitySignals: true,
      guidance: getDiscoverabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getDiscoverabilityvaultizabilityRollout() {
    const discoverabilityvaultizabilityTableCoverage =
      await this.discoverabilityvaultizabilityStatusService.getDiscoverabilityvaultizabilityTableCoverage()

    const rollout = evaluateDiscoverabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.discoverabilityvaultizabilityStatusService.pingPostgres(),
      existingDiscoverabilityvaultizabilityTableCount: discoverabilityvaultizabilityTableCoverage.existingDiscoverabilityvaultizabilityTableCount,
      shieldScansTableExists: discoverabilityvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: discoverabilityvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: discoverabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return discoverabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDiscoverabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDiscoverabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.discoverabilityvaultizabilityStatusService.getWorkspaceDiscoverabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildDiscoverabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.discoverabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildDiscoverabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return discoverabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDiscoverabilityvaultizabilityAdminActions(),
      guidance: getDiscoverabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeDiscoverabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_discoverabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageDiscoverabilityvaultizability(authContext)

    const payload = discoverabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_discoverabilityvaultizability_summary': {
        const summary = await this.getWorkspaceDiscoverabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return discoverabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed discoverabilityvaultizability summary with ${summary.stats.discoverabilityvaultizabilityPercent}% shield scan discoverabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDiscoverabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production discoverabilityvaultizability tools.',
    })
  }
}
