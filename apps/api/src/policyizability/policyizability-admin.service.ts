import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPolicyizabilityRolloutGuidance,
  policyizabilityAdminActionRequestSchema,
  policyizabilityAdminActionResponseSchema,
  policyizabilityAdminSummaryResponseSchema,
  policyizabilityCapabilitiesResponseSchema,
  policyizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPolicyizabilityAdminRecords,
  buildPolicyizabilityAdminStats,
  getPolicyizabilityAdminGuidance,
  resolvePolicyizabilityAdminActions,
} from './policyizability-admin.helpers.js'
import { evaluatePolicyizabilityRollout } from './policyizability-rollout.helpers.js'
import { PolicyizabilityStatusService } from './policyizability-status.service.js'

@Injectable()
export class PolicyizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly policyizabilityStatusService: PolicyizabilityStatusService,
  ) {}

  getCapabilities() {
    return policyizabilityCapabilitiesResponseSchema.parse({
      supportsPolicyizabilityRollout: true,
      supportsPolicyizabilityAdminTools: true,
      supportsMembershipPolicyizabilitySignals: true,
      supportsUsageEventPolicyizabilitySignals: true,
      guidance: getPolicyizabilityRolloutGuidance(),
    })
  }

  async getPolicyizabilityRollout() {
    const policyizabilityTableCoverage =
      await this.policyizabilityStatusService.getPolicyizabilityTableCoverage()

    const rollout = evaluatePolicyizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.policyizabilityStatusService.pingPostgres(),
      existingPolicyizabilityTableCount: policyizabilityTableCoverage.existingPolicyizabilityTableCount,
      workspaceMembershipsTableExists: policyizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: policyizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: policyizabilityTableCoverage.billingNotificationsTableExists,
    })

    return policyizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePolicyizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePolicyizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.policyizabilityStatusService.getWorkspacePolicyizabilityInventory(
        workspaceId,
      )
    const records = buildPolicyizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.policyizabilityStatusService.pingPostgres()
    const stats = buildPolicyizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return policyizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePolicyizabilityAdminActions(),
      guidance: getPolicyizabilityAdminGuidance({ stats }),
    })
  }

  async executePolicyizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_policyizability_summary'
    },
  ) {
    this.assertCanManagePolicyizability(authContext)

    const payload = policyizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_policyizability_summary': {
        const summary = await this.getWorkspacePolicyizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return policyizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed policyizability summary with ${summary.stats.policyizabilityPercent}% membership policyizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePolicyizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production policyizability tools.',
    })
  }
}
