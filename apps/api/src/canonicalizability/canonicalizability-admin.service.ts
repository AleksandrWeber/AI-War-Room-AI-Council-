import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCanonicalizabilityRolloutGuidance,
  canonicalizabilityAdminActionRequestSchema,
  canonicalizabilityAdminActionResponseSchema,
  canonicalizabilityAdminSummaryResponseSchema,
  canonicalizabilityCapabilitiesResponseSchema,
  canonicalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCanonicalizabilityAdminRecords,
  buildCanonicalizabilityAdminStats,
  getCanonicalizabilityAdminGuidance,
  resolveCanonicalizabilityAdminActions,
} from './canonicalizability-admin.helpers.js'
import { evaluateCanonicalizabilityRollout } from './canonicalizability-rollout.helpers.js'
import { CanonicalizabilityStatusService } from './canonicalizability-status.service.js'

@Injectable()
export class CanonicalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly canonicalizabilityStatusService: CanonicalizabilityStatusService,
  ) {}

  getCapabilities() {
    return canonicalizabilityCapabilitiesResponseSchema.parse({
      supportsCanonicalizabilityRollout: true,
      supportsCanonicalizabilityAdminTools: true,
      supportsModelHealthCanonicalizabilitySignals: true,
      supportsModelRegistryCanonicalizabilitySignals: true,
      guidance: getCanonicalizabilityRolloutGuidance(),
    })
  }

  async getCanonicalizabilityRollout() {
    const canonicalizabilityTableCoverage =
      await this.canonicalizabilityStatusService.getCanonicalizabilityTableCoverage()

    const rollout = evaluateCanonicalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.canonicalizabilityStatusService.pingPostgres(),
      existingCanonicalizabilityTableCount: canonicalizabilityTableCoverage.existingCanonicalizabilityTableCount,
      modelHealthEventsTableExists: canonicalizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: canonicalizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: canonicalizabilityTableCoverage.billingRecordsTableExists,
    })

    return canonicalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCanonicalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCanonicalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.canonicalizabilityStatusService.getWorkspaceCanonicalizabilityInventory(
        workspaceId,
      )
    const records = buildCanonicalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.canonicalizabilityStatusService.pingPostgres()
    const stats = buildCanonicalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return canonicalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCanonicalizabilityAdminActions(),
      guidance: getCanonicalizabilityAdminGuidance({ stats }),
    })
  }

  async executeCanonicalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_canonicalizability_summary'
    },
  ) {
    this.assertCanManageCanonicalizability(authContext)

    const payload = canonicalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_canonicalizability_summary': {
        const summary = await this.getWorkspaceCanonicalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return canonicalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed canonicalizability summary with ${summary.stats.canonicalizabilityPercent}% model health canonicalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCanonicalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production canonicalizability tools.',
    })
  }
}
