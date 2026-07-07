import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIdentifiabilityvaultizabilityRolloutGuidance,
  identifiabilityvaultizabilityAdminActionRequestSchema,
  identifiabilityvaultizabilityAdminActionResponseSchema,
  identifiabilityvaultizabilityAdminSummaryResponseSchema,
  identifiabilityvaultizabilityCapabilitiesResponseSchema,
  identifiabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIdentifiabilityvaultizabilityAdminRecords,
  buildIdentifiabilityvaultizabilityAdminStats,
  getIdentifiabilityvaultizabilityAdminGuidance,
  resolveIdentifiabilityvaultizabilityAdminActions,
} from './identifiabilityvaultizability-admin.helpers.js'
import { evaluateIdentifiabilityvaultizabilityRollout } from './identifiabilityvaultizability-rollout.helpers.js'
import { IdentifiabilityvaultizabilityStatusService } from './identifiabilityvaultizability-status.service.js'

@Injectable()
export class IdentifiabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly identifiabilityvaultizabilityStatusService: IdentifiabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return identifiabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsIdentifiabilityvaultizabilityRollout: true,
      supportsIdentifiabilityvaultizabilityAdminTools: true,
      supportsMembershipIdentifiabilityvaultizabilitySignals: true,
      supportsUsageEventIdentifiabilityvaultizabilitySignals: true,
      guidance: getIdentifiabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getIdentifiabilityvaultizabilityRollout() {
    const identifiabilityvaultizabilityTableCoverage =
      await this.identifiabilityvaultizabilityStatusService.getIdentifiabilityvaultizabilityTableCoverage()

    const rollout = evaluateIdentifiabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.identifiabilityvaultizabilityStatusService.pingPostgres(),
      existingIdentifiabilityvaultizabilityTableCount: identifiabilityvaultizabilityTableCoverage.existingIdentifiabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: identifiabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: identifiabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: identifiabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return identifiabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIdentifiabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIdentifiabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.identifiabilityvaultizabilityStatusService.getWorkspaceIdentifiabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildIdentifiabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.identifiabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildIdentifiabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return identifiabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIdentifiabilityvaultizabilityAdminActions(),
      guidance: getIdentifiabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeIdentifiabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_identifiabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageIdentifiabilityvaultizability(authContext)

    const payload = identifiabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_identifiabilityvaultizability_summary': {
        const summary = await this.getWorkspaceIdentifiabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return identifiabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed identifiabilityvaultizability summary with ${summary.stats.identifiabilityvaultizabilityPercent}% membership identifiabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIdentifiabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production identifiabilityvaultizability tools.',
    })
  }
}
