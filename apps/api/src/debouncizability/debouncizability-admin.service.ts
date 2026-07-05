import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDebouncizabilityRolloutGuidance,
  debouncizabilityAdminActionRequestSchema,
  debouncizabilityAdminActionResponseSchema,
  debouncizabilityAdminSummaryResponseSchema,
  debouncizabilityCapabilitiesResponseSchema,
  debouncizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDebouncizabilityAdminRecords,
  buildDebouncizabilityAdminStats,
  getDebouncizabilityAdminGuidance,
  resolveDebouncizabilityAdminActions,
} from './debouncizability-admin.helpers.js'
import { evaluateDebouncizabilityRollout } from './debouncizability-rollout.helpers.js'
import { DebouncizabilityStatusService } from './debouncizability-status.service.js'

@Injectable()
export class DebouncizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly debouncizabilityStatusService: DebouncizabilityStatusService,
  ) {}

  getCapabilities() {
    return debouncizabilityCapabilitiesResponseSchema.parse({
      supportsDebouncizabilityRollout: true,
      supportsDebouncizabilityAdminTools: true,
      supportsModelHealthDebouncizabilitySignals: true,
      supportsModelRegistryDebouncizabilitySignals: true,
      guidance: getDebouncizabilityRolloutGuidance(),
    })
  }

  async getDebouncizabilityRollout() {
    const debouncizabilityTableCoverage =
      await this.debouncizabilityStatusService.getDebouncizabilityTableCoverage()

    const rollout = evaluateDebouncizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.debouncizabilityStatusService.pingPostgres(),
      existingDebouncizabilityTableCount: debouncizabilityTableCoverage.existingDebouncizabilityTableCount,
      modelHealthEventsTableExists: debouncizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: debouncizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: debouncizabilityTableCoverage.billingRecordsTableExists,
    })

    return debouncizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDebouncizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDebouncizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.debouncizabilityStatusService.getWorkspaceDebouncizabilityInventory(
        workspaceId,
      )
    const records = buildDebouncizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.debouncizabilityStatusService.pingPostgres()
    const stats = buildDebouncizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return debouncizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDebouncizabilityAdminActions(),
      guidance: getDebouncizabilityAdminGuidance({ stats }),
    })
  }

  async executeDebouncizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_debouncizability_summary'
    },
  ) {
    this.assertCanManageDebouncizability(authContext)

    const payload = debouncizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_debouncizability_summary': {
        const summary = await this.getWorkspaceDebouncizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return debouncizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed debouncizability summary with ${summary.stats.debouncizabilityPercent}% model health debouncizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDebouncizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production debouncizability tools.',
    })
  }
}
