import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDeterminizabilityRolloutGuidance,
  determinizabilityAdminActionRequestSchema,
  determinizabilityAdminActionResponseSchema,
  determinizabilityAdminSummaryResponseSchema,
  determinizabilityCapabilitiesResponseSchema,
  determinizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDeterminizabilityAdminRecords,
  buildDeterminizabilityAdminStats,
  getDeterminizabilityAdminGuidance,
  resolveDeterminizabilityAdminActions,
} from './determinizability-admin.helpers.js'
import { evaluateDeterminizabilityRollout } from './determinizability-rollout.helpers.js'
import { DeterminizabilityStatusService } from './determinizability-status.service.js'

@Injectable()
export class DeterminizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly determinizabilityStatusService: DeterminizabilityStatusService,
  ) {}

  getCapabilities() {
    return determinizabilityCapabilitiesResponseSchema.parse({
      supportsDeterminizabilityRollout: true,
      supportsDeterminizabilityAdminTools: true,
      supportsWorkspaceLimitDeterminizabilitySignals: true,
      supportsUsageEventDeterminizabilitySignals: true,
      guidance: getDeterminizabilityRolloutGuidance(),
    })
  }

  async getDeterminizabilityRollout() {
    const determinizabilityTableCoverage =
      await this.determinizabilityStatusService.getDeterminizabilityTableCoverage()

    const rollout = evaluateDeterminizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.determinizabilityStatusService.pingPostgres(),
      existingDeterminizabilityTableCount: determinizabilityTableCoverage.existingDeterminizabilityTableCount,
      workspaceUsageLimitsTableExists: determinizabilityTableCoverage.workspaceUsageLimitsTableExists,
      usageEventsTableExists: determinizabilityTableCoverage.usageEventsTableExists,
      billingRecordsTableExists: determinizabilityTableCoverage.billingRecordsTableExists,
    })

    return determinizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDeterminizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDeterminizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.determinizabilityStatusService.getWorkspaceDeterminizabilityInventory(
        workspaceId,
      )
    const records = buildDeterminizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.determinizabilityStatusService.pingPostgres()
    const stats = buildDeterminizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return determinizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDeterminizabilityAdminActions(),
      guidance: getDeterminizabilityAdminGuidance({ stats }),
    })
  }

  async executeDeterminizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_determinizability_summary'
    },
  ) {
    this.assertCanManageDeterminizability(authContext)

    const payload = determinizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_determinizability_summary': {
        const summary = await this.getWorkspaceDeterminizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return determinizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed determinizability summary with ${summary.stats.determinizabilityPercent}% workspace limit determinizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDeterminizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production determinizability tools.',
    })
  }
}
