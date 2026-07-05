import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProvenanceRolloutGuidance,
  provenanceAdminActionRequestSchema,
  provenanceAdminActionResponseSchema,
  provenanceAdminSummaryResponseSchema,
  provenanceCapabilitiesResponseSchema,
  provenanceRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProvenanceAdminRecords,
  buildProvenanceAdminStats,
  getProvenanceAdminGuidance,
  resolveProvenanceAdminActions,
} from './provenance-admin.helpers.js'
import { evaluateProvenanceRollout } from './provenance-rollout.helpers.js'
import { ProvenanceStatusService } from './provenance-status.service.js'

@Injectable()
export class ProvenanceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly provenanceStatusService: ProvenanceStatusService,
  ) {}

  getCapabilities() {
    return provenanceCapabilitiesResponseSchema.parse({
      supportsProvenanceRollout: true,
      supportsProvenanceAdminTools: true,
      supportsUsageProvenanceSignals: true,
      supportsAgentOutputProvenanceSignals: true,
      guidance: getProvenanceRolloutGuidance(),
    })
  }

  async getProvenanceRollout() {
    const provenanceTableCoverage =
      await this.provenanceStatusService.getProvenanceTableCoverage()

    const rollout = evaluateProvenanceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.provenanceStatusService.pingPostgres(),
      existingProvenanceTableCount: provenanceTableCoverage.existingProvenanceTableCount,
      usageEventsTableExists: provenanceTableCoverage.usageEventsTableExists,
      agentOutputsTableExists: provenanceTableCoverage.agentOutputsTableExists,
      artifactsTableExists: provenanceTableCoverage.artifactsTableExists,
    })

    return provenanceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProvenanceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProvenance(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.provenanceStatusService.getWorkspaceProvenanceInventory(
        workspaceId,
      )
    const records = buildProvenanceAdminRecords(inventoryItems)
    const postgresConnectivity = await this.provenanceStatusService.pingPostgres()
    const stats = buildProvenanceAdminStats({
      records,
      postgresConnectivity,
    })

    return provenanceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProvenanceAdminActions(),
      guidance: getProvenanceAdminGuidance({ stats }),
    })
  }

  async executeProvenanceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_provenance_summary'
    },
  ) {
    this.assertCanManageProvenance(authContext)

    const payload = provenanceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_provenance_summary': {
        const summary = await this.getWorkspaceProvenanceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return provenanceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed provenance summary with ${summary.stats.provenancePercent}% usage provenance across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProvenance(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production provenance tools.',
    })
  }
}
