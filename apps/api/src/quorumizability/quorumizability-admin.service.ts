import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getQuorumizabilityRolloutGuidance,
  quorumizabilityAdminActionRequestSchema,
  quorumizabilityAdminActionResponseSchema,
  quorumizabilityAdminSummaryResponseSchema,
  quorumizabilityCapabilitiesResponseSchema,
  quorumizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildQuorumizabilityAdminRecords,
  buildQuorumizabilityAdminStats,
  getQuorumizabilityAdminGuidance,
  resolveQuorumizabilityAdminActions,
} from './quorumizability-admin.helpers.js'
import { evaluateQuorumizabilityRollout } from './quorumizability-rollout.helpers.js'
import { QuorumizabilityStatusService } from './quorumizability-status.service.js'

@Injectable()
export class QuorumizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly quorumizabilityStatusService: QuorumizabilityStatusService,
  ) {}

  getCapabilities() {
    return quorumizabilityCapabilitiesResponseSchema.parse({
      supportsQuorumizabilityRollout: true,
      supportsQuorumizabilityAdminTools: true,
      supportsShieldScanQuorumizabilitySignals: true,
      supportsProviderCredentialQuorumizabilitySignals: true,
      guidance: getQuorumizabilityRolloutGuidance(),
    })
  }

  async getQuorumizabilityRollout() {
    const quorumizabilityTableCoverage =
      await this.quorumizabilityStatusService.getQuorumizabilityTableCoverage()

    const rollout = evaluateQuorumizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.quorumizabilityStatusService.pingPostgres(),
      existingQuorumizabilityTableCount: quorumizabilityTableCoverage.existingQuorumizabilityTableCount,
      shieldScansTableExists: quorumizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: quorumizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: quorumizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return quorumizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceQuorumizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageQuorumizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.quorumizabilityStatusService.getWorkspaceQuorumizabilityInventory(
        workspaceId,
      )
    const records = buildQuorumizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.quorumizabilityStatusService.pingPostgres()
    const stats = buildQuorumizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return quorumizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveQuorumizabilityAdminActions(),
      guidance: getQuorumizabilityAdminGuidance({ stats }),
    })
  }

  async executeQuorumizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_quorumizability_summary'
    },
  ) {
    this.assertCanManageQuorumizability(authContext)

    const payload = quorumizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_quorumizability_summary': {
        const summary = await this.getWorkspaceQuorumizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return quorumizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed quorumizability summary with ${summary.stats.quorumizabilityPercent}% shield scan quorumizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageQuorumizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production quorumizability tools.',
    })
  }
}
