import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCategorizabilityRolloutGuidance,
  categorizabilityAdminActionRequestSchema,
  categorizabilityAdminActionResponseSchema,
  categorizabilityAdminSummaryResponseSchema,
  categorizabilityCapabilitiesResponseSchema,
  categorizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCategorizabilityAdminRecords,
  buildCategorizabilityAdminStats,
  getCategorizabilityAdminGuidance,
  resolveCategorizabilityAdminActions,
} from './categorizability-admin.helpers.js'
import { evaluateCategorizabilityRollout } from './categorizability-rollout.helpers.js'
import { CategorizabilityStatusService } from './categorizability-status.service.js'

@Injectable()
export class CategorizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly categorizabilityStatusService: CategorizabilityStatusService,
  ) {}

  getCapabilities() {
    return categorizabilityCapabilitiesResponseSchema.parse({
      supportsCategorizabilityRollout: true,
      supportsCategorizabilityAdminTools: true,
      supportsModelHealthCategorizabilitySignals: true,
      supportsModelRegistryCategorizabilitySignals: true,
      guidance: getCategorizabilityRolloutGuidance(),
    })
  }

  async getCategorizabilityRollout() {
    const categorizabilityTableCoverage =
      await this.categorizabilityStatusService.getCategorizabilityTableCoverage()

    const rollout = evaluateCategorizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.categorizabilityStatusService.pingPostgres(),
      existingCategorizabilityTableCount: categorizabilityTableCoverage.existingCategorizabilityTableCount,
      modelHealthEventsTableExists: categorizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: categorizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: categorizabilityTableCoverage.billingRecordsTableExists,
    })

    return categorizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCategorizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCategorizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.categorizabilityStatusService.getWorkspaceCategorizabilityInventory(
        workspaceId,
      )
    const records = buildCategorizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.categorizabilityStatusService.pingPostgres()
    const stats = buildCategorizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return categorizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCategorizabilityAdminActions(),
      guidance: getCategorizabilityAdminGuidance({ stats }),
    })
  }

  async executeCategorizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_categorizability_summary'
    },
  ) {
    this.assertCanManageCategorizability(authContext)

    const payload = categorizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_categorizability_summary': {
        const summary = await this.getWorkspaceCategorizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return categorizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed categorizability summary with ${summary.stats.categorizabilityPercent}% model health categorizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCategorizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production categorizability tools.',
    })
  }
}
