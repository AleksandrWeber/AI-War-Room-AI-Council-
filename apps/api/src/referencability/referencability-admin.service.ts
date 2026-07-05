import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getReferencabilityRolloutGuidance,
  referencabilityAdminActionRequestSchema,
  referencabilityAdminActionResponseSchema,
  referencabilityAdminSummaryResponseSchema,
  referencabilityCapabilitiesResponseSchema,
  referencabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildReferencabilityAdminRecords,
  buildReferencabilityAdminStats,
  getReferencabilityAdminGuidance,
  resolveReferencabilityAdminActions,
} from './referencability-admin.helpers.js'
import { evaluateReferencabilityRollout } from './referencability-rollout.helpers.js'
import { ReferencabilityStatusService } from './referencability-status.service.js'

@Injectable()
export class ReferencabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly referencabilityStatusService: ReferencabilityStatusService,
  ) {}

  getCapabilities() {
    return referencabilityCapabilitiesResponseSchema.parse({
      supportsReferencabilityRollout: true,
      supportsReferencabilityAdminTools: true,
      supportsArtifactReferencabilitySignals: true,
      supportsWorkflowReferencabilitySignals: true,
      guidance: getReferencabilityRolloutGuidance(),
    })
  }

  async getReferencabilityRollout() {
    const referencabilityTableCoverage =
      await this.referencabilityStatusService.getReferencabilityTableCoverage()

    const rollout = evaluateReferencabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.referencabilityStatusService.pingPostgres(),
      existingReferencabilityTableCount: referencabilityTableCoverage.existingReferencabilityTableCount,
      artifactsTableExists: referencabilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: referencabilityTableCoverage.runWorkflowsTableExists,
      billingRecordsTableExists: referencabilityTableCoverage.billingRecordsTableExists,
    })

    return referencabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceReferencabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageReferencability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.referencabilityStatusService.getWorkspaceReferencabilityInventory(
        workspaceId,
      )
    const records = buildReferencabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.referencabilityStatusService.pingPostgres()
    const stats = buildReferencabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return referencabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveReferencabilityAdminActions(),
      guidance: getReferencabilityAdminGuidance({ stats }),
    })
  }

  async executeReferencabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_referencability_summary'
    },
  ) {
    this.assertCanManageReferencability(authContext)

    const payload = referencabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_referencability_summary': {
        const summary = await this.getWorkspaceReferencabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return referencabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed referencability summary with ${summary.stats.referencabilityPercent}% artifact referencability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageReferencability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production referencability tools.',
    })
  }
}
