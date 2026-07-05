import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReadabilityRolloutGuidance,
  readabilityAdminActionRequestSchema,
  readabilityAdminActionResponseSchema,
  readabilityAdminSummaryResponseSchema,
  readabilityCapabilitiesResponseSchema,
  readabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReadabilityAdminRecords,
  buildReadabilityAdminStats,
  getReadabilityAdminGuidance,
  resolveReadabilityAdminActions,
} from './readability-admin.helpers.js'
import { evaluateReadabilityRollout } from './readability-rollout.helpers.js'
import { ReadabilityStatusService } from './readability-status.service.js'

@Injectable()
export class ReadabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly readabilityStatusService: ReadabilityStatusService,
  ) {}

  getCapabilities() {
    return readabilityCapabilitiesResponseSchema.parse({
      supportsReadabilityRollout: true,
      supportsReadabilityAdminTools: true,
      supportsArtifactReadabilitySignals: true,
      supportsAgentOutputReadabilitySignals: true,
      guidance: getReadabilityRolloutGuidance(),
    })
  }

  async getReadabilityRollout() {
    const readabilityTableCoverage =
      await this.readabilityStatusService.getReadabilityTableCoverage()

    const rollout = evaluateReadabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.readabilityStatusService.pingPostgres(),
      existingReadabilityTableCount: readabilityTableCoverage.existingReadabilityTableCount,
      artifactsTableExists: readabilityTableCoverage.artifactsTableExists,
      agentOutputsTableExists: readabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: readabilityTableCoverage.moderatorSynthesesTableExists,
    })

    return readabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReadabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReadability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.readabilityStatusService.getWorkspaceReadabilityInventory(
        workspaceId,
      )
    const records = buildReadabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.readabilityStatusService.pingPostgres()
    const stats = buildReadabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return readabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReadabilityAdminActions(),
      guidance: getReadabilityAdminGuidance({ stats }),
    })
  }

  async executeReadabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_readability_summary'
    },
  ) {
    this.assertCanManageReadability(authContext)

    const payload = readabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_readability_summary': {
        const summary = await this.getWorkspaceReadabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return readabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed readability summary with ${summary.stats.readabilityPercent}% artifact readability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReadability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production readability tools.',
    })
  }
}
