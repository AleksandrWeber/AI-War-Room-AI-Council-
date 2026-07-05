import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getPersonifiabilityRolloutGuidance,
  personifiabilityAdminActionRequestSchema,
  personifiabilityAdminActionResponseSchema,
  personifiabilityAdminSummaryResponseSchema,
  personifiabilityCapabilitiesResponseSchema,
  personifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildPersonifiabilityAdminRecords,
  buildPersonifiabilityAdminStats,
  getPersonifiabilityAdminGuidance,
  resolvePersonifiabilityAdminActions,
} from './personifiability-admin.helpers.js'
import { evaluatePersonifiabilityRollout } from './personifiability-rollout.helpers.js'
import { PersonifiabilityStatusService } from './personifiability-status.service.js'

@Injectable()
export class PersonifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly personifiabilityStatusService: PersonifiabilityStatusService,
  ) {}

  getCapabilities() {
    return personifiabilityCapabilitiesResponseSchema.parse({
      supportsPersonifiabilityRollout: true,
      supportsPersonifiabilityAdminTools: true,
      supportsAgentOutputPersonifiabilitySignals: true,
      supportsSynthesisPersonifiabilitySignals: true,
      guidance: getPersonifiabilityRolloutGuidance(),
    })
  }

  async getPersonifiabilityRollout() {
    const personifiabilityTableCoverage =
      await this.personifiabilityStatusService.getPersonifiabilityTableCoverage()

    const rollout = evaluatePersonifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.personifiabilityStatusService.pingPostgres(),
      existingPersonifiabilityTableCount: personifiabilityTableCoverage.existingPersonifiabilityTableCount,
      agentOutputsTableExists: personifiabilityTableCoverage.agentOutputsTableExists,
      moderatorSynthesesTableExists: personifiabilityTableCoverage.moderatorSynthesesTableExists,
      artifactsTableExists: personifiabilityTableCoverage.artifactsTableExists,
    })

    return personifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspacePersonifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManagePersonifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.personifiabilityStatusService.getWorkspacePersonifiabilityInventory(
        workspaceId,
      )
    const records = buildPersonifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.personifiabilityStatusService.pingPostgres()
    const stats = buildPersonifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return personifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolvePersonifiabilityAdminActions(),
      guidance: getPersonifiabilityAdminGuidance({ stats }),
    })
  }

  async executePersonifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_personifiability_summary'
    },
  ) {
    this.assertCanManagePersonifiability(authContext)

    const payload = personifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_personifiability_summary': {
        const summary = await this.getWorkspacePersonifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return personifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed personifiability summary with ${summary.stats.personifiabilityPercent}% agent output personifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManagePersonifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production personifiability tools.',
    })
  }
}
