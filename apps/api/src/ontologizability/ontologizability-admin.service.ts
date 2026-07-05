import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getOntologizabilityRolloutGuidance,
  ontologizabilityAdminActionRequestSchema,
  ontologizabilityAdminActionResponseSchema,
  ontologizabilityAdminSummaryResponseSchema,
  ontologizabilityCapabilitiesResponseSchema,
  ontologizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildOntologizabilityAdminRecords,
  buildOntologizabilityAdminStats,
  getOntologizabilityAdminGuidance,
  resolveOntologizabilityAdminActions,
} from './ontologizability-admin.helpers.js'
import { evaluateOntologizabilityRollout } from './ontologizability-rollout.helpers.js'
import { OntologizabilityStatusService } from './ontologizability-status.service.js'

@Injectable()
export class OntologizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ontologizabilityStatusService: OntologizabilityStatusService,
  ) {}

  getCapabilities() {
    return ontologizabilityCapabilitiesResponseSchema.parse({
      supportsOntologizabilityRollout: true,
      supportsOntologizabilityAdminTools: true,
      supportsMembershipOntologizabilitySignals: true,
      supportsUsageEventOntologizabilitySignals: true,
      guidance: getOntologizabilityRolloutGuidance(),
    })
  }

  async getOntologizabilityRollout() {
    const ontologizabilityTableCoverage =
      await this.ontologizabilityStatusService.getOntologizabilityTableCoverage()

    const rollout = evaluateOntologizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.ontologizabilityStatusService.pingPostgres(),
      existingOntologizabilityTableCount: ontologizabilityTableCoverage.existingOntologizabilityTableCount,
      workspaceMembershipsTableExists: ontologizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: ontologizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: ontologizabilityTableCoverage.billingNotificationsTableExists,
    })

    return ontologizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceOntologizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageOntologizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.ontologizabilityStatusService.getWorkspaceOntologizabilityInventory(
        workspaceId,
      )
    const records = buildOntologizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.ontologizabilityStatusService.pingPostgres()
    const stats = buildOntologizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return ontologizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveOntologizabilityAdminActions(),
      guidance: getOntologizabilityAdminGuidance({ stats }),
    })
  }

  async executeOntologizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_ontologizability_summary'
    },
  ) {
    this.assertCanManageOntologizability(authContext)

    const payload = ontologizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_ontologizability_summary': {
        const summary = await this.getWorkspaceOntologizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ontologizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed ontologizability summary with ${summary.stats.ontologizabilityPercent}% membership ontologizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageOntologizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ontologizability tools.',
    })
  }
}
