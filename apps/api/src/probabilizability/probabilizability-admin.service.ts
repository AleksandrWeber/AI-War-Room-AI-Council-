import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProbabilizabilityRolloutGuidance,
  probabilizabilityAdminActionRequestSchema,
  probabilizabilityAdminActionResponseSchema,
  probabilizabilityAdminSummaryResponseSchema,
  probabilizabilityCapabilitiesResponseSchema,
  probabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProbabilizabilityAdminRecords,
  buildProbabilizabilityAdminStats,
  getProbabilizabilityAdminGuidance,
  resolveProbabilizabilityAdminActions,
} from './probabilizability-admin.helpers.js'
import { evaluateProbabilizabilityRollout } from './probabilizability-rollout.helpers.js'
import { ProbabilizabilityStatusService } from './probabilizability-status.service.js'

@Injectable()
export class ProbabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly probabilizabilityStatusService: ProbabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return probabilizabilityCapabilitiesResponseSchema.parse({
      supportsProbabilizabilityRollout: true,
      supportsProbabilizabilityAdminTools: true,
      supportsBillingWebhookProbabilizabilitySignals: true,
      supportsBillingRecordProbabilizabilitySignals: true,
      guidance: getProbabilizabilityRolloutGuidance(),
    })
  }

  async getProbabilizabilityRollout() {
    const probabilizabilityTableCoverage =
      await this.probabilizabilityStatusService.getProbabilizabilityTableCoverage()

    const rollout = evaluateProbabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.probabilizabilityStatusService.pingPostgres(),
      existingProbabilizabilityTableCount: probabilizabilityTableCoverage.existingProbabilizabilityTableCount,
      billingWebhookEventsTableExists: probabilizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: probabilizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: probabilizabilityTableCoverage.usageEventsTableExists,
    })

    return probabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProbabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProbabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.probabilizabilityStatusService.getWorkspaceProbabilizabilityInventory(
        workspaceId,
      )
    const records = buildProbabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.probabilizabilityStatusService.pingPostgres()
    const stats = buildProbabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return probabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProbabilizabilityAdminActions(),
      guidance: getProbabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeProbabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_probabilizability_summary'
    },
  ) {
    this.assertCanManageProbabilizability(authContext)

    const payload = probabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_probabilizability_summary': {
        const summary = await this.getWorkspaceProbabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return probabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed probabilizability summary with ${summary.stats.probabilizabilityPercent}% billing webhook probabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProbabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production probabilizability tools.',
    })
  }
}
