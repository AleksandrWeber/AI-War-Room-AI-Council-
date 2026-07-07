import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getGovernancetrackizabilityRolloutGuidance,
  governancetrackizabilityAdminActionRequestSchema,
  governancetrackizabilityAdminActionResponseSchema,
  governancetrackizabilityAdminSummaryResponseSchema,
  governancetrackizabilityCapabilitiesResponseSchema,
  governancetrackizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildGovernancetrackizabilityAdminRecords,
  buildGovernancetrackizabilityAdminStats,
  getGovernancetrackizabilityAdminGuidance,
  resolveGovernancetrackizabilityAdminActions,
} from './governancetrackizability-admin.helpers.js'
import { evaluateGovernancetrackizabilityRollout } from './governancetrackizability-rollout.helpers.js'
import { GovernancetrackizabilityStatusService } from './governancetrackizability-status.service.js'

@Injectable()
export class GovernancetrackizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly governancetrackizabilityStatusService: GovernancetrackizabilityStatusService,
  ) {}

  getCapabilities() {
    return governancetrackizabilityCapabilitiesResponseSchema.parse({
      supportsGovernancetrackizabilityRollout: true,
      supportsGovernancetrackizabilityAdminTools: true,
      supportsBillingInvoiceGovernancetrackizabilitySignals: true,
      supportsBillingRecordGovernancetrackizabilitySignals: true,
      guidance: getGovernancetrackizabilityRolloutGuidance(),
    })
  }

  async getGovernancetrackizabilityRollout() {
    const governancetrackizabilityTableCoverage =
      await this.governancetrackizabilityStatusService.getGovernancetrackizabilityTableCoverage()

    const rollout = evaluateGovernancetrackizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.governancetrackizabilityStatusService.pingPostgres(),
      existingGovernancetrackizabilityTableCount: governancetrackizabilityTableCoverage.existingGovernancetrackizabilityTableCount,
      billingInvoicesTableExists: governancetrackizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: governancetrackizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: governancetrackizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return governancetrackizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceGovernancetrackizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageGovernancetrackizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.governancetrackizabilityStatusService.getWorkspaceGovernancetrackizabilityInventory(
        workspaceId,
      )
    const records = buildGovernancetrackizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.governancetrackizabilityStatusService.pingPostgres()
    const stats = buildGovernancetrackizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return governancetrackizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveGovernancetrackizabilityAdminActions(),
      guidance: getGovernancetrackizabilityAdminGuidance({ stats }),
    })
  }

  async executeGovernancetrackizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_governancetrackizability_summary'
    },
  ) {
    this.assertCanManageGovernancetrackizability(authContext)

    const payload = governancetrackizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_governancetrackizability_summary': {
        const summary = await this.getWorkspaceGovernancetrackizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return governancetrackizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed governancetrackizability summary with ${summary.stats.governancetrackizabilityPercent}% billing invoice governancetrackizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageGovernancetrackizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production governancetrackizability tools.',
    })
  }
}
