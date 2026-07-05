import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getValidityRolloutGuidance,
  validityAdminActionRequestSchema,
  validityAdminActionResponseSchema,
  validityAdminSummaryResponseSchema,
  validityCapabilitiesResponseSchema,
  validityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildValidityAdminRecords,
  buildValidityAdminStats,
  getValidityAdminGuidance,
  resolveValidityAdminActions,
} from './validity-admin.helpers.js'
import { evaluateValidityRollout } from './validity-rollout.helpers.js'
import { ValidityStatusService } from './validity-status.service.js'

@Injectable()
export class ValidityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly validityStatusService: ValidityStatusService,
  ) {}

  getCapabilities() {
    return validityCapabilitiesResponseSchema.parse({
      supportsValidityRollout: true,
      supportsValidityAdminTools: true,
      supportsAgentOutputValiditySignals: true,
      supportsArtifactValiditySignals: true,
      guidance: getValidityRolloutGuidance(),
    })
  }

  async getValidityRollout() {
    const validityTableCoverage =
      await this.validityStatusService.getValidityTableCoverage()

    const rollout = evaluateValidityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.validityStatusService.pingPostgres(),
      existingValidityTableCount: validityTableCoverage.existingValidityTableCount,
      agentOutputsTableExists: validityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: validityTableCoverage.artifactsTableExists,
      shieldScansTableExists: validityTableCoverage.shieldScansTableExists,
    })

    return validityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceValidityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageValidity(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.validityStatusService.getWorkspaceValidityInventory(
        workspaceId,
      )
    const records = buildValidityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.validityStatusService.pingPostgres()
    const stats = buildValidityAdminStats({
      records,
      postgresConnectivity,
    })

    return validityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveValidityAdminActions(),
      guidance: getValidityAdminGuidance({ stats }),
    })
  }

  async executeValidityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_validity_summary'
    },
  ) {
    this.assertCanManageValidity(authContext)

    const payload = validityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_validity_summary': {
        const summary = await this.getWorkspaceValidityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return validityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed validity summary with ${summary.stats.validityPercent}% agent output validity across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageValidity(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production validity tools.',
    })
  }
}
