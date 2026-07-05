import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAssessabilityRolloutGuidance,
  assessabilityAdminActionRequestSchema,
  assessabilityAdminActionResponseSchema,
  assessabilityAdminSummaryResponseSchema,
  assessabilityCapabilitiesResponseSchema,
  assessabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAssessabilityAdminRecords,
  buildAssessabilityAdminStats,
  getAssessabilityAdminGuidance,
  resolveAssessabilityAdminActions,
} from './assessability-admin.helpers.js'
import { evaluateAssessabilityRollout } from './assessability-rollout.helpers.js'
import { AssessabilityStatusService } from './assessability-status.service.js'

@Injectable()
export class AssessabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly assessabilityStatusService: AssessabilityStatusService,
  ) {}

  getCapabilities() {
    return assessabilityCapabilitiesResponseSchema.parse({
      supportsAssessabilityRollout: true,
      supportsAssessabilityAdminTools: true,
      supportsModelHealthAssessabilitySignals: true,
      supportsModelRegistryAssessabilitySignals: true,
      guidance: getAssessabilityRolloutGuidance(),
    })
  }

  async getAssessabilityRollout() {
    const assessabilityTableCoverage =
      await this.assessabilityStatusService.getAssessabilityTableCoverage()

    const rollout = evaluateAssessabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.assessabilityStatusService.pingPostgres(),
      existingAssessabilityTableCount: assessabilityTableCoverage.existingAssessabilityTableCount,
      modelHealthEventsTableExists: assessabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: assessabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: assessabilityTableCoverage.billingRecordsTableExists,
    })

    return assessabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAssessabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAssessability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.assessabilityStatusService.getWorkspaceAssessabilityInventory(
        workspaceId,
      )
    const records = buildAssessabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.assessabilityStatusService.pingPostgres()
    const stats = buildAssessabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return assessabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAssessabilityAdminActions(),
      guidance: getAssessabilityAdminGuidance({ stats }),
    })
  }

  async executeAssessabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_assessability_summary'
    },
  ) {
    this.assertCanManageAssessability(authContext)

    const payload = assessabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_assessability_summary': {
        const summary = await this.getWorkspaceAssessabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return assessabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed assessability summary with ${summary.stats.assessabilityPercent}% model health assessability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAssessability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production assessability tools.',
    })
  }
}
