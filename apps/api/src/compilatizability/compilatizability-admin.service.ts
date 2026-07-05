import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCompilatizabilityRolloutGuidance,
  compilatizabilityAdminActionRequestSchema,
  compilatizabilityAdminActionResponseSchema,
  compilatizabilityAdminSummaryResponseSchema,
  compilatizabilityCapabilitiesResponseSchema,
  compilatizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCompilatizabilityAdminRecords,
  buildCompilatizabilityAdminStats,
  getCompilatizabilityAdminGuidance,
  resolveCompilatizabilityAdminActions,
} from './compilatizability-admin.helpers.js'
import { evaluateCompilatizabilityRollout } from './compilatizability-rollout.helpers.js'
import { CompilatizabilityStatusService } from './compilatizability-status.service.js'

@Injectable()
export class CompilatizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly compilatizabilityStatusService: CompilatizabilityStatusService,
  ) {}

  getCapabilities() {
    return compilatizabilityCapabilitiesResponseSchema.parse({
      supportsCompilatizabilityRollout: true,
      supportsCompilatizabilityAdminTools: true,
      supportsModelHealthCompilatizabilitySignals: true,
      supportsModelRegistryCompilatizabilitySignals: true,
      guidance: getCompilatizabilityRolloutGuidance(),
    })
  }

  async getCompilatizabilityRollout() {
    const compilatizabilityTableCoverage =
      await this.compilatizabilityStatusService.getCompilatizabilityTableCoverage()

    const rollout = evaluateCompilatizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.compilatizabilityStatusService.pingPostgres(),
      existingCompilatizabilityTableCount: compilatizabilityTableCoverage.existingCompilatizabilityTableCount,
      modelHealthEventsTableExists: compilatizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: compilatizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: compilatizabilityTableCoverage.billingRecordsTableExists,
    })

    return compilatizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCompilatizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompilatizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.compilatizabilityStatusService.getWorkspaceCompilatizabilityInventory(
        workspaceId,
      )
    const records = buildCompilatizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.compilatizabilityStatusService.pingPostgres()
    const stats = buildCompilatizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return compilatizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCompilatizabilityAdminActions(),
      guidance: getCompilatizabilityAdminGuidance({ stats }),
    })
  }

  async executeCompilatizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compilatizability_summary'
    },
  ) {
    this.assertCanManageCompilatizability(authContext)

    const payload = compilatizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compilatizability_summary': {
        const summary = await this.getWorkspaceCompilatizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return compilatizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compilatizability summary with ${summary.stats.compilatizabilityPercent}% model health compilatizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCompilatizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compilatizability tools.',
    })
  }
}
