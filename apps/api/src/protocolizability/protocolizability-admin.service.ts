import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProtocolizabilityRolloutGuidance,
  protocolizabilityAdminActionRequestSchema,
  protocolizabilityAdminActionResponseSchema,
  protocolizabilityAdminSummaryResponseSchema,
  protocolizabilityCapabilitiesResponseSchema,
  protocolizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProtocolizabilityAdminRecords,
  buildProtocolizabilityAdminStats,
  getProtocolizabilityAdminGuidance,
  resolveProtocolizabilityAdminActions,
} from './protocolizability-admin.helpers.js'
import { evaluateProtocolizabilityRollout } from './protocolizability-rollout.helpers.js'
import { ProtocolizabilityStatusService } from './protocolizability-status.service.js'

@Injectable()
export class ProtocolizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly protocolizabilityStatusService: ProtocolizabilityStatusService,
  ) {}

  getCapabilities() {
    return protocolizabilityCapabilitiesResponseSchema.parse({
      supportsProtocolizabilityRollout: true,
      supportsProtocolizabilityAdminTools: true,
      supportsModelHealthProtocolizabilitySignals: true,
      supportsModelRegistryProtocolizabilitySignals: true,
      guidance: getProtocolizabilityRolloutGuidance(),
    })
  }

  async getProtocolizabilityRollout() {
    const protocolizabilityTableCoverage =
      await this.protocolizabilityStatusService.getProtocolizabilityTableCoverage()

    const rollout = evaluateProtocolizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.protocolizabilityStatusService.pingPostgres(),
      existingProtocolizabilityTableCount: protocolizabilityTableCoverage.existingProtocolizabilityTableCount,
      modelHealthEventsTableExists: protocolizabilityTableCoverage.modelHealthEventsTableExists,
      modelRegistryEntriesTableExists: protocolizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingRecordsTableExists: protocolizabilityTableCoverage.billingRecordsTableExists,
    })

    return protocolizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProtocolizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProtocolizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.protocolizabilityStatusService.getWorkspaceProtocolizabilityInventory(
        workspaceId,
      )
    const records = buildProtocolizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.protocolizabilityStatusService.pingPostgres()
    const stats = buildProtocolizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return protocolizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProtocolizabilityAdminActions(),
      guidance: getProtocolizabilityAdminGuidance({ stats }),
    })
  }

  async executeProtocolizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_protocolizability_summary'
    },
  ) {
    this.assertCanManageProtocolizability(authContext)

    const payload = protocolizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_protocolizability_summary': {
        const summary = await this.getWorkspaceProtocolizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return protocolizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed protocolizability summary with ${summary.stats.protocolizabilityPercent}% model health protocolizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProtocolizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production protocolizability tools.',
    })
  }
}
