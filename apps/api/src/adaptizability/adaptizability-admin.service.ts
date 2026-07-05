import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAdaptizabilityRolloutGuidance,
  adaptizabilityAdminActionRequestSchema,
  adaptizabilityAdminActionResponseSchema,
  adaptizabilityAdminSummaryResponseSchema,
  adaptizabilityCapabilitiesResponseSchema,
  adaptizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAdaptizabilityAdminRecords,
  buildAdaptizabilityAdminStats,
  getAdaptizabilityAdminGuidance,
  resolveAdaptizabilityAdminActions,
} from './adaptizability-admin.helpers.js'
import { evaluateAdaptizabilityRollout } from './adaptizability-rollout.helpers.js'
import { AdaptizabilityStatusService } from './adaptizability-status.service.js'

@Injectable()
export class AdaptizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly adaptizabilityStatusService: AdaptizabilityStatusService,
  ) {}

  getCapabilities() {
    return adaptizabilityCapabilitiesResponseSchema.parse({
      supportsAdaptizabilityRollout: true,
      supportsAdaptizabilityAdminTools: true,
      supportsModelHealthAdaptizabilitySignals: true,
      supportsModelRegistryAdaptizabilitySignals: true,
      guidance: getAdaptizabilityRolloutGuidance(),
    })
  }

  async getAdaptizabilityRollout() {
    const adaptizabilityTableCoverage =
      await this.adaptizabilityStatusService.getAdaptizabilityTableCoverage()

    const rollout = evaluateAdaptizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.adaptizabilityStatusService.pingPostgres(),
      existingAdaptizabilityTableCount: adaptizabilityTableCoverage.existingAdaptizabilityTableCount,
      modelHealthEventsTableExists: adaptizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: adaptizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: adaptizabilityTableCoverage.billingRecordsTableExists,
    })

    return adaptizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAdaptizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAdaptizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.adaptizabilityStatusService.getWorkspaceAdaptizabilityInventory(
        workspaceId,
      )
    const records = buildAdaptizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.adaptizabilityStatusService.pingPostgres()
    const stats = buildAdaptizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return adaptizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAdaptizabilityAdminActions(),
      guidance: getAdaptizabilityAdminGuidance({ stats }),
    })
  }

  async executeAdaptizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_adaptizability_summary'
    },
  ) {
    this.assertCanManageAdaptizability(authContext)

    const payload = adaptizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_adaptizability_summary': {
        const summary = await this.getWorkspaceAdaptizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return adaptizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed adaptizability summary with ${summary.stats.adaptizabilityPercent}% model health adaptizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAdaptizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production adaptizability tools.',
    })
  }
}
