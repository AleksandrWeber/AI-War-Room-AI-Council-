import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getMaterializationizabilityRolloutGuidance,
  materializationizabilityAdminActionRequestSchema,
  materializationizabilityAdminActionResponseSchema,
  materializationizabilityAdminSummaryResponseSchema,
  materializationizabilityCapabilitiesResponseSchema,
  materializationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildMaterializationizabilityAdminRecords,
  buildMaterializationizabilityAdminStats,
  getMaterializationizabilityAdminGuidance,
  resolveMaterializationizabilityAdminActions,
} from './materializationizability-admin.helpers.js'
import { evaluateMaterializationizabilityRollout } from './materializationizability-rollout.helpers.js'
import { MaterializationizabilityStatusService } from './materializationizability-status.service.js'

@Injectable()
export class MaterializationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly materializationizabilityStatusService: MaterializationizabilityStatusService,
  ) {}

  getCapabilities() {
    return materializationizabilityCapabilitiesResponseSchema.parse({
      supportsMaterializationizabilityRollout: true,
      supportsMaterializationizabilityAdminTools: true,
      supportsModelHealthMaterializationizabilitySignals: true,
      supportsModelRegistryMaterializationizabilitySignals: true,
      guidance: getMaterializationizabilityRolloutGuidance(),
    })
  }

  async getMaterializationizabilityRollout() {
    const materializationizabilityTableCoverage =
      await this.materializationizabilityStatusService.getMaterializationizabilityTableCoverage()

    const rollout = evaluateMaterializationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.materializationizabilityStatusService.pingPostgres(),
      existingMaterializationizabilityTableCount: materializationizabilityTableCoverage.existingMaterializationizabilityTableCount,
      modelHealthEventsTableExists: materializationizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: materializationizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: materializationizabilityTableCoverage.billingRecordsTableExists,
    })

    return materializationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceMaterializationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageMaterializationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.materializationizabilityStatusService.getWorkspaceMaterializationizabilityInventory(
        workspaceId,
      )
    const records = buildMaterializationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.materializationizabilityStatusService.pingPostgres()
    const stats = buildMaterializationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return materializationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveMaterializationizabilityAdminActions(),
      guidance: getMaterializationizabilityAdminGuidance({ stats }),
    })
  }

  async executeMaterializationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_materializationizability_summary'
    },
  ) {
    this.assertCanManageMaterializationizability(authContext)

    const payload = materializationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_materializationizability_summary': {
        const summary = await this.getWorkspaceMaterializationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return materializationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed materializationizability summary with ${summary.stats.materializationizabilityPercent}% model health materializationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageMaterializationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production materializationizability tools.',
    })
  }
}
