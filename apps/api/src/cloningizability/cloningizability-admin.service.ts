import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCloningizabilityRolloutGuidance,
  cloningizabilityAdminActionRequestSchema,
  cloningizabilityAdminActionResponseSchema,
  cloningizabilityAdminSummaryResponseSchema,
  cloningizabilityCapabilitiesResponseSchema,
  cloningizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCloningizabilityAdminRecords,
  buildCloningizabilityAdminStats,
  getCloningizabilityAdminGuidance,
  resolveCloningizabilityAdminActions,
} from './cloningizability-admin.helpers.js'
import { evaluateCloningizabilityRollout } from './cloningizability-rollout.helpers.js'
import { CloningizabilityStatusService } from './cloningizability-status.service.js'

@Injectable()
export class CloningizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly cloningizabilityStatusService: CloningizabilityStatusService,
  ) {}

  getCapabilities() {
    return cloningizabilityCapabilitiesResponseSchema.parse({
      supportsCloningizabilityRollout: true,
      supportsCloningizabilityAdminTools: true,
      supportsWorkspaceLimitCloningizabilitySignals: true,
      supportsUsageEventCloningizabilitySignals: true,
      guidance: getCloningizabilityRolloutGuidance(),
    })
  }

  async getCloningizabilityRollout() {
    const cloningizabilityTableCoverage =
      await this.cloningizabilityStatusService.getCloningizabilityTableCoverage()

    const rollout = evaluateCloningizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.cloningizabilityStatusService.pingPostgres(),
      existingCloningizabilityTableCount: cloningizabilityTableCoverage.existingCloningizabilityTableCount,
      workspaceUsageLimitsTableExists: cloningizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: cloningizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: cloningizabilityTableCoverage.billingRecordsTableExists,
    })

    return cloningizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCloningizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCloningizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.cloningizabilityStatusService.getWorkspaceCloningizabilityInventory(
        workspaceId,
      )
    const records = buildCloningizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.cloningizabilityStatusService.pingPostgres()
    const stats = buildCloningizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return cloningizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCloningizabilityAdminActions(),
      guidance: getCloningizabilityAdminGuidance({ stats }),
    })
  }

  async executeCloningizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_cloningizability_summary'
    },
  ) {
    this.assertCanManageCloningizability(authContext)

    const payload = cloningizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_cloningizability_summary': {
        const summary = await this.getWorkspaceCloningizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return cloningizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed cloningizability summary with ${summary.stats.cloningizabilityPercent}% workspace limit cloningizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCloningizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production cloningizability tools.',
    })
  }
}
