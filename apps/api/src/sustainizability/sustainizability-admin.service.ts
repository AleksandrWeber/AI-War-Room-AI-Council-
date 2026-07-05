import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSustainizabilityRolloutGuidance,
  sustainizabilityAdminActionRequestSchema,
  sustainizabilityAdminActionResponseSchema,
  sustainizabilityAdminSummaryResponseSchema,
  sustainizabilityCapabilitiesResponseSchema,
  sustainizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSustainizabilityAdminRecords,
  buildSustainizabilityAdminStats,
  getSustainizabilityAdminGuidance,
  resolveSustainizabilityAdminActions,
} from './sustainizability-admin.helpers.js'
import { evaluateSustainizabilityRollout } from './sustainizability-rollout.helpers.js'
import { SustainizabilityStatusService } from './sustainizability-status.service.js'

@Injectable()
export class SustainizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly sustainizabilityStatusService: SustainizabilityStatusService,
  ) {}

  getCapabilities() {
    return sustainizabilityCapabilitiesResponseSchema.parse({
      supportsSustainizabilityRollout: true,
      supportsSustainizabilityAdminTools: true,
      supportsModelHealthSustainizabilitySignals: true,
      supportsModelRegistrySustainizabilitySignals: true,
      guidance: getSustainizabilityRolloutGuidance(),
    })
  }

  async getSustainizabilityRollout() {
    const sustainizabilityTableCoverage =
      await this.sustainizabilityStatusService.getSustainizabilityTableCoverage()

    const rollout = evaluateSustainizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.sustainizabilityStatusService.pingPostgres(),
      existingSustainizabilityTableCount: sustainizabilityTableCoverage.existingSustainizabilityTableCount,
      modelHealthEventsTableExists: sustainizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: sustainizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: sustainizabilityTableCoverage.billingRecordsTableExists,
    })

    return sustainizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSustainizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSustainizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.sustainizabilityStatusService.getWorkspaceSustainizabilityInventory(
        workspaceId,
      )
    const records = buildSustainizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.sustainizabilityStatusService.pingPostgres()
    const stats = buildSustainizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return sustainizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSustainizabilityAdminActions(),
      guidance: getSustainizabilityAdminGuidance({ stats }),
    })
  }

  async executeSustainizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_sustainizability_summary'
    },
  ) {
    this.assertCanManageSustainizability(authContext)

    const payload = sustainizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_sustainizability_summary': {
        const summary = await this.getWorkspaceSustainizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return sustainizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed sustainizability summary with ${summary.stats.sustainizabilityPercent}% model health sustainizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSustainizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production sustainizability tools.',
    })
  }
}
