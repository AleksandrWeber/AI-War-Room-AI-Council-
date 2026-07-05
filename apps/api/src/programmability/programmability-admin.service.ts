import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getProgrammabilityRolloutGuidance,
  programmabilityAdminActionRequestSchema,
  programmabilityAdminActionResponseSchema,
  programmabilityAdminSummaryResponseSchema,
  programmabilityCapabilitiesResponseSchema,
  programmabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildProgrammabilityAdminRecords,
  buildProgrammabilityAdminStats,
  getProgrammabilityAdminGuidance,
  resolveProgrammabilityAdminActions,
} from './programmability-admin.helpers.js'
import { evaluateProgrammabilityRollout } from './programmability-rollout.helpers.js'
import { ProgrammabilityStatusService } from './programmability-status.service.js'

@Injectable()
export class ProgrammabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly programmabilityStatusService: ProgrammabilityStatusService,
  ) {}

  getCapabilities() {
    return programmabilityCapabilitiesResponseSchema.parse({
      supportsProgrammabilityRollout: true,
      supportsProgrammabilityAdminTools: true,
      supportsWorkflowProgrammabilitySignals: true,
      supportsAgentOutputProgrammabilitySignals: true,
      guidance: getProgrammabilityRolloutGuidance(),
    })
  }

  async getProgrammabilityRollout() {
    const programmabilityTableCoverage =
      await this.programmabilityStatusService.getProgrammabilityTableCoverage()

    const rollout = evaluateProgrammabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.programmabilityStatusService.pingPostgres(),
      existingProgrammabilityTableCount: programmabilityTableCoverage.existingProgrammabilityTableCount,
      runWorkflowsTableExists: programmabilityTableCoverage.runWorkflowsTableExists,
      agentOutputsTableExists: programmabilityTableCoverage.agentOutputsTableExists,
      artifactsTableExists: programmabilityTableCoverage.artifactsTableExists,
    })

    return programmabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceProgrammabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageProgrammability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.programmabilityStatusService.getWorkspaceProgrammabilityInventory(
        workspaceId,
      )
    const records = buildProgrammabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.programmabilityStatusService.pingPostgres()
    const stats = buildProgrammabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return programmabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveProgrammabilityAdminActions(),
      guidance: getProgrammabilityAdminGuidance({ stats }),
    })
  }

  async executeProgrammabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_programmability_summary'
    },
  ) {
    this.assertCanManageProgrammability(authContext)

    const payload = programmabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_programmability_summary': {
        const summary = await this.getWorkspaceProgrammabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return programmabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed programmability summary with ${summary.stats.programmabilityPercent}% workflow programmability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageProgrammability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production programmability tools.',
    })
  }
}
