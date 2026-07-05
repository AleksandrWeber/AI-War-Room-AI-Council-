import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getFamiliarityRolloutGuidance,
  familiarityAdminActionRequestSchema,
  familiarityAdminActionResponseSchema,
  familiarityAdminSummaryResponseSchema,
  familiarityCapabilitiesResponseSchema,
  familiarityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildFamiliarityAdminRecords,
  buildFamiliarityAdminStats,
  getFamiliarityAdminGuidance,
  resolveFamiliarityAdminActions,
} from './familiarity-admin.helpers.js'
import { evaluateFamiliarityRollout } from './familiarity-rollout.helpers.js'
import { FamiliarityStatusService } from './familiarity-status.service.js'

@Injectable()
export class FamiliarityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly familiarityStatusService: FamiliarityStatusService,
  ) {}

  getCapabilities() {
    return familiarityCapabilitiesResponseSchema.parse({
      supportsFamiliarityRollout: true,
      supportsFamiliarityAdminTools: true,
      supportsMembershipFamiliaritySignals: true,
      supportsUsageEventFamiliaritySignals: true,
      guidance: getFamiliarityRolloutGuidance(),
    })
  }

  async getFamiliarityRollout() {
    const familiarityTableCoverage =
      await this.familiarityStatusService.getFamiliarityTableCoverage()

    const rollout = evaluateFamiliarityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.familiarityStatusService.pingPostgres(),
      existingFamiliarityTableCount: familiarityTableCoverage.existingFamiliarityTableCount,
      workspaceMembershipsTableExists: familiarityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: familiarityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: familiarityTableCoverage.billingNotificationsTableExists,
    })

    return familiarityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceFamiliarityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageFamiliarity(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.familiarityStatusService.getWorkspaceFamiliarityInventory(
        workspaceId,
      )
    const records = buildFamiliarityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.familiarityStatusService.pingPostgres()
    const stats = buildFamiliarityAdminStats({
      records,
      postgresConnectivity,
    })

    return familiarityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveFamiliarityAdminActions(),
      guidance: getFamiliarityAdminGuidance({ stats }),
    })
  }

  async executeFamiliarityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_familiarity_summary'
    },
  ) {
    this.assertCanManageFamiliarity(authContext)

    const payload = familiarityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_familiarity_summary': {
        const summary = await this.getWorkspaceFamiliarityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return familiarityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed familiarity summary with ${summary.stats.familiarityPercent}% membership familiarity across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageFamiliarity(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production familiarity tools.',
    })
  }
}
