import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getChainofcustodyizabilityRolloutGuidance,
  chainofcustodyizabilityAdminActionRequestSchema,
  chainofcustodyizabilityAdminActionResponseSchema,
  chainofcustodyizabilityAdminSummaryResponseSchema,
  chainofcustodyizabilityCapabilitiesResponseSchema,
  chainofcustodyizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildChainofcustodyizabilityAdminRecords,
  buildChainofcustodyizabilityAdminStats,
  getChainofcustodyizabilityAdminGuidance,
  resolveChainofcustodyizabilityAdminActions,
} from './chainofcustodyizability-admin.helpers.js'
import { evaluateChainofcustodyizabilityRollout } from './chainofcustodyizability-rollout.helpers.js'
import { ChainofcustodyizabilityStatusService } from './chainofcustodyizability-status.service.js'

@Injectable()
export class ChainofcustodyizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly chainofcustodyizabilityStatusService: ChainofcustodyizabilityStatusService,
  ) {}

  getCapabilities() {
    return chainofcustodyizabilityCapabilitiesResponseSchema.parse({
      supportsChainofcustodyizabilityRollout: true,
      supportsChainofcustodyizabilityAdminTools: true,
      supportsShieldScanChainofcustodyizabilitySignals: true,
      supportsProviderCredentialChainofcustodyizabilitySignals: true,
      guidance: getChainofcustodyizabilityRolloutGuidance(),
    })
  }

  async getChainofcustodyizabilityRollout() {
    const chainofcustodyizabilityTableCoverage =
      await this.chainofcustodyizabilityStatusService.getChainofcustodyizabilityTableCoverage()

    const rollout = evaluateChainofcustodyizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.chainofcustodyizabilityStatusService.pingPostgres(),
      existingChainofcustodyizabilityTableCount: chainofcustodyizabilityTableCoverage.existingChainofcustodyizabilityTableCount,
      shieldScansTableExists: chainofcustodyizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: chainofcustodyizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: chainofcustodyizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return chainofcustodyizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceChainofcustodyizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageChainofcustodyizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.chainofcustodyizabilityStatusService.getWorkspaceChainofcustodyizabilityInventory(
        workspaceId,
      )
    const records = buildChainofcustodyizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.chainofcustodyizabilityStatusService.pingPostgres()
    const stats = buildChainofcustodyizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return chainofcustodyizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveChainofcustodyizabilityAdminActions(),
      guidance: getChainofcustodyizabilityAdminGuidance({ stats }),
    })
  }

  async executeChainofcustodyizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_chainofcustodyizability_summary'
    },
  ) {
    this.assertCanManageChainofcustodyizability(authContext)

    const payload = chainofcustodyizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_chainofcustodyizability_summary': {
        const summary = await this.getWorkspaceChainofcustodyizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return chainofcustodyizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed chainofcustodyizability summary with ${summary.stats.chainofcustodyizabilityPercent}% shield scan chainofcustodyizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageChainofcustodyizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production chainofcustodyizability tools.',
    })
  }
}
