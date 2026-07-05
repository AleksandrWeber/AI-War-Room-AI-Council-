import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAssuranceRolloutGuidance,
  assuranceAdminActionRequestSchema,
  assuranceAdminActionResponseSchema,
  assuranceAdminSummaryResponseSchema,
  assuranceCapabilitiesResponseSchema,
  assuranceRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAssuranceAdminRecords,
  buildAssuranceAdminStats,
  getAssuranceAdminGuidance,
  resolveAssuranceAdminActions,
} from './assurance-admin.helpers.js'
import { evaluateAssuranceRollout } from './assurance-rollout.helpers.js'
import { AssuranceStatusService } from './assurance-status.service.js'

@Injectable()
export class AssuranceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly assuranceStatusService: AssuranceStatusService,
  ) {}

  getCapabilities() {
    return assuranceCapabilitiesResponseSchema.parse({
      supportsAssuranceRollout: true,
      supportsAssuranceAdminTools: true,
      supportsShieldQualityAssuranceSignals: true,
      supportsArtifactQualityAssuranceSignals: true,
      guidance: getAssuranceRolloutGuidance(),
    })
  }

  async getAssuranceRollout() {
    const assuranceTableCoverage =
      await this.assuranceStatusService.getAssuranceTableCoverage()

    const rollout = evaluateAssuranceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.assuranceStatusService.pingPostgres(),
      existingAssuranceTableCount:
        assuranceTableCoverage.existingAssuranceTableCount,
      shieldScansTableExists: assuranceTableCoverage.shieldScansTableExists,
      artifactsTableExists: assuranceTableCoverage.artifactsTableExists,
      agentOutputsTableExists: assuranceTableCoverage.agentOutputsTableExists,
    })

    return assuranceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAssuranceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAssurance(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.assuranceStatusService.getWorkspaceAssuranceInventory(
        workspaceId,
      )
    const records = buildAssuranceAdminRecords(inventoryItems)
    const postgresConnectivity =
      await this.assuranceStatusService.pingPostgres()
    const stats = buildAssuranceAdminStats({
      records,
      postgresConnectivity,
    })

    return assuranceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAssuranceAdminActions(),
      guidance: getAssuranceAdminGuidance({ stats }),
    })
  }

  async executeAssuranceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_assurance_summary'
    },
  ) {
    this.assertCanManageAssurance(authContext)

    const payload = assuranceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_assurance_summary': {
        const summary = await this.getWorkspaceAssuranceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return assuranceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed assurance summary with ${summary.stats.assurancePercent}% shield quality assurance across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAssurance(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production assurance tools.',
    })
  }
}
