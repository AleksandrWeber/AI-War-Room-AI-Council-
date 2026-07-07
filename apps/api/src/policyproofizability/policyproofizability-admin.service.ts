import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPolicyproofizabilityRolloutGuidance,
  policyproofizabilityAdminActionRequestSchema,
  policyproofizabilityAdminActionResponseSchema,
  policyproofizabilityAdminSummaryResponseSchema,
  policyproofizabilityCapabilitiesResponseSchema,
  policyproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPolicyproofizabilityAdminRecords,
  buildPolicyproofizabilityAdminStats,
  getPolicyproofizabilityAdminGuidance,
  resolvePolicyproofizabilityAdminActions,
} from './policyproofizability-admin.helpers.js'
import { evaluatePolicyproofizabilityRollout } from './policyproofizability-rollout.helpers.js'
import { PolicyproofizabilityStatusService } from './policyproofizability-status.service.js'

@Injectable()
export class PolicyproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly policyproofizabilityStatusService: PolicyproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return policyproofizabilityCapabilitiesResponseSchema.parse({
      supportsPolicyproofizabilityRollout: true,
      supportsPolicyproofizabilityAdminTools: true,
      supportsBillingInvoicePolicyproofizabilitySignals: true,
      supportsBillingRecordPolicyproofizabilitySignals: true,
      guidance: getPolicyproofizabilityRolloutGuidance(),
    })
  }

  async getPolicyproofizabilityRollout() {
    const policyproofizabilityTableCoverage =
      await this.policyproofizabilityStatusService.getPolicyproofizabilityTableCoverage()

    const rollout = evaluatePolicyproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.policyproofizabilityStatusService.pingPostgres(),
      existingPolicyproofizabilityTableCount: policyproofizabilityTableCoverage.existingPolicyproofizabilityTableCount,
      billingInvoicesTableExists: policyproofizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: policyproofizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: policyproofizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return policyproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePolicyproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePolicyproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.policyproofizabilityStatusService.getWorkspacePolicyproofizabilityInventory(
        workspaceId,
      )
    const records = buildPolicyproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.policyproofizabilityStatusService.pingPostgres()
    const stats = buildPolicyproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return policyproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePolicyproofizabilityAdminActions(),
      guidance: getPolicyproofizabilityAdminGuidance({ stats }),
    })
  }

  async executePolicyproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_policyproofizability_summary'
    },
  ) {
    this.assertCanManagePolicyproofizability(authContext)

    const payload = policyproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_policyproofizability_summary': {
        const summary = await this.getWorkspacePolicyproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return policyproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed policyproofizability summary with ${summary.stats.policyproofizabilityPercent}% billing invoice policyproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePolicyproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production policyproofizability tools.',
    })
  }
}
