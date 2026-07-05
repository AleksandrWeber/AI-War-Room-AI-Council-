import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNodelizabilityRolloutGuidance,
  nodelizabilityAdminActionRequestSchema,
  nodelizabilityAdminActionResponseSchema,
  nodelizabilityAdminSummaryResponseSchema,
  nodelizabilityCapabilitiesResponseSchema,
  nodelizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNodelizabilityAdminRecords,
  buildNodelizabilityAdminStats,
  getNodelizabilityAdminGuidance,
  resolveNodelizabilityAdminActions,
} from './nodelizability-admin.helpers.js'
import { evaluateNodelizabilityRollout } from './nodelizability-rollout.helpers.js'
import { NodelizabilityStatusService } from './nodelizability-status.service.js'

@Injectable()
export class NodelizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly nodelizabilityStatusService: NodelizabilityStatusService,
  ) {}

  getCapabilities() {
    return nodelizabilityCapabilitiesResponseSchema.parse({
      supportsNodelizabilityRollout: true,
      supportsNodelizabilityAdminTools: true,
      supportsShieldScanNodelizabilitySignals: true,
      supportsProviderCredentialNodelizabilitySignals: true,
      guidance: getNodelizabilityRolloutGuidance(),
    })
  }

  async getNodelizabilityRollout() {
    const nodelizabilityTableCoverage =
      await this.nodelizabilityStatusService.getNodelizabilityTableCoverage()

    const rollout = evaluateNodelizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.nodelizabilityStatusService.pingPostgres(),
      existingNodelizabilityTableCount: nodelizabilityTableCoverage.existingNodelizabilityTableCount,
      shieldScansTableExists: nodelizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: nodelizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: nodelizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return nodelizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNodelizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNodelizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.nodelizabilityStatusService.getWorkspaceNodelizabilityInventory(
        workspaceId,
      )
    const records = buildNodelizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.nodelizabilityStatusService.pingPostgres()
    const stats = buildNodelizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return nodelizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNodelizabilityAdminActions(),
      guidance: getNodelizabilityAdminGuidance({ stats }),
    })
  }

  async executeNodelizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_nodelizability_summary'
    },
  ) {
    this.assertCanManageNodelizability(authContext)

    const payload = nodelizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_nodelizability_summary': {
        const summary = await this.getWorkspaceNodelizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return nodelizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed nodelizability summary with ${summary.stats.nodelizabilityPercent}% shield scan nodelizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNodelizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production nodelizability tools.',
    })
  }
}
