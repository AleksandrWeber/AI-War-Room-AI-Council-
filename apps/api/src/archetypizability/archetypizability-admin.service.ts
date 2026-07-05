import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getArchetypizabilityRolloutGuidance,
  archetypizabilityAdminActionRequestSchema,
  archetypizabilityAdminActionResponseSchema,
  archetypizabilityAdminSummaryResponseSchema,
  archetypizabilityCapabilitiesResponseSchema,
  archetypizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildArchetypizabilityAdminRecords,
  buildArchetypizabilityAdminStats,
  getArchetypizabilityAdminGuidance,
  resolveArchetypizabilityAdminActions,
} from './archetypizability-admin.helpers.js'
import { evaluateArchetypizabilityRollout } from './archetypizability-rollout.helpers.js'
import { ArchetypizabilityStatusService } from './archetypizability-status.service.js'

@Injectable()
export class ArchetypizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly archetypizabilityStatusService: ArchetypizabilityStatusService,
  ) {}

  getCapabilities() {
    return archetypizabilityCapabilitiesResponseSchema.parse({
      supportsArchetypizabilityRollout: true,
      supportsArchetypizabilityAdminTools: true,
      supportsBillingRecordArchetypizabilitySignals: true,
      supportsBillingInvoiceArchetypizabilitySignals: true,
      guidance: getArchetypizabilityRolloutGuidance(),
    })
  }

  async getArchetypizabilityRollout() {
    const archetypizabilityTableCoverage =
      await this.archetypizabilityStatusService.getArchetypizabilityTableCoverage()

    const rollout = evaluateArchetypizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.archetypizabilityStatusService.pingPostgres(),
      existingArchetypizabilityTableCount: archetypizabilityTableCoverage.existingArchetypizabilityTableCount,
      billingRecordsTableExists: archetypizabilityTableCoverage.billingRecordsTableExists,
      billingInvoicesTableExists: archetypizabilityTableCoverage.billingInvoicesTableExists,
      usageEventsTableExists: archetypizabilityTableCoverage.usageEventsTableExists,
    })

    return archetypizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceArchetypizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageArchetypizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.archetypizabilityStatusService.getWorkspaceArchetypizabilityInventory(
        workspaceId,
      )
    const records = buildArchetypizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.archetypizabilityStatusService.pingPostgres()
    const stats = buildArchetypizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return archetypizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveArchetypizabilityAdminActions(),
      guidance: getArchetypizabilityAdminGuidance({ stats }),
    })
  }

  async executeArchetypizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_archetypizability_summary'
    },
  ) {
    this.assertCanManageArchetypizability(authContext)

    const payload = archetypizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_archetypizability_summary': {
        const summary = await this.getWorkspaceArchetypizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return archetypizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed archetypizability summary with ${summary.stats.archetypizabilityPercent}% billing record archetypizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageArchetypizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production archetypizability tools.',
    })
  }
}
