import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAllocationizabilityRolloutGuidance,
  allocationizabilityAdminActionRequestSchema,
  allocationizabilityAdminActionResponseSchema,
  allocationizabilityAdminSummaryResponseSchema,
  allocationizabilityCapabilitiesResponseSchema,
  allocationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAllocationizabilityAdminRecords,
  buildAllocationizabilityAdminStats,
  getAllocationizabilityAdminGuidance,
  resolveAllocationizabilityAdminActions,
} from './allocationizability-admin.helpers.js'
import { evaluateAllocationizabilityRollout } from './allocationizability-rollout.helpers.js'
import { AllocationizabilityStatusService } from './allocationizability-status.service.js'

@Injectable()
export class AllocationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly allocationizabilityStatusService: AllocationizabilityStatusService,
  ) {}

  getCapabilities() {
    return allocationizabilityCapabilitiesResponseSchema.parse({
      supportsAllocationizabilityRollout: true,
      supportsAllocationizabilityAdminTools: true,
      supportsProviderCredentialAllocationizabilitySignals: true,
      supportsModelRegistryAllocationizabilitySignals: true,
      guidance: getAllocationizabilityRolloutGuidance(),
    })
  }

  async getAllocationizabilityRollout() {
    const allocationizabilityTableCoverage =
      await this.allocationizabilityStatusService.getAllocationizabilityTableCoverage()

    const rollout = evaluateAllocationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.allocationizabilityStatusService.pingPostgres(),
      existingAllocationizabilityTableCount: allocationizabilityTableCoverage.existingAllocationizabilityTableCount,
      workspaceProviderCredentialsTableExists: allocationizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: allocationizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: allocationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return allocationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAllocationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAllocationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.allocationizabilityStatusService.getWorkspaceAllocationizabilityInventory(
        workspaceId,
      )
    const records = buildAllocationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.allocationizabilityStatusService.pingPostgres()
    const stats = buildAllocationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return allocationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAllocationizabilityAdminActions(),
      guidance: getAllocationizabilityAdminGuidance({ stats }),
    })
  }

  async executeAllocationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_allocationizability_summary'
    },
  ) {
    this.assertCanManageAllocationizability(authContext)

    const payload = allocationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_allocationizability_summary': {
        const summary = await this.getWorkspaceAllocationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return allocationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed allocationizability summary with ${summary.stats.allocationizabilityPercent}% provider credential allocationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAllocationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production allocationizability tools.',
    })
  }
}
