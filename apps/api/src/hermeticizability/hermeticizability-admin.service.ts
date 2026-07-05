import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getHermeticizabilityRolloutGuidance,
  hermeticizabilityAdminActionRequestSchema,
  hermeticizabilityAdminActionResponseSchema,
  hermeticizabilityAdminSummaryResponseSchema,
  hermeticizabilityCapabilitiesResponseSchema,
  hermeticizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildHermeticizabilityAdminRecords,
  buildHermeticizabilityAdminStats,
  getHermeticizabilityAdminGuidance,
  resolveHermeticizabilityAdminActions,
} from './hermeticizability-admin.helpers.js'
import { evaluateHermeticizabilityRollout } from './hermeticizability-rollout.helpers.js'
import { HermeticizabilityStatusService } from './hermeticizability-status.service.js'

@Injectable()
export class HermeticizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly hermeticizabilityStatusService: HermeticizabilityStatusService,
  ) {}

  getCapabilities() {
    return hermeticizabilityCapabilitiesResponseSchema.parse({
      supportsHermeticizabilityRollout: true,
      supportsHermeticizabilityAdminTools: true,
      supportsModelHealthHermeticizabilitySignals: true,
      supportsModelRegistryHermeticizabilitySignals: true,
      guidance: getHermeticizabilityRolloutGuidance(),
    })
  }

  async getHermeticizabilityRollout() {
    const hermeticizabilityTableCoverage =
      await this.hermeticizabilityStatusService.getHermeticizabilityTableCoverage()

    const rollout = evaluateHermeticizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.hermeticizabilityStatusService.pingPostgres(),
      existingHermeticizabilityTableCount: hermeticizabilityTableCoverage.existingHermeticizabilityTableCount,
      modelHealthEventsTableExists: hermeticizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: hermeticizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: hermeticizabilityTableCoverage.billingRecordsTableExists,
    })

    return hermeticizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceHermeticizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageHermeticizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.hermeticizabilityStatusService.getWorkspaceHermeticizabilityInventory(
        workspaceId,
      )
    const records = buildHermeticizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.hermeticizabilityStatusService.pingPostgres()
    const stats = buildHermeticizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return hermeticizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveHermeticizabilityAdminActions(),
      guidance: getHermeticizabilityAdminGuidance({ stats }),
    })
  }

  async executeHermeticizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_hermeticizability_summary'
    },
  ) {
    this.assertCanManageHermeticizability(authContext)

    const payload = hermeticizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_hermeticizability_summary': {
        const summary = await this.getWorkspaceHermeticizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return hermeticizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed hermeticizability summary with ${summary.stats.hermeticizabilityPercent}% model health hermeticizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageHermeticizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production hermeticizability tools.',
    })
  }
}
