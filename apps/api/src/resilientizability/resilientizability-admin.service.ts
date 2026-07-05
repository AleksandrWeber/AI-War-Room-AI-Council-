import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getResilientizabilityRolloutGuidance,
  resilientizabilityAdminActionRequestSchema,
  resilientizabilityAdminActionResponseSchema,
  resilientizabilityAdminSummaryResponseSchema,
  resilientizabilityCapabilitiesResponseSchema,
  resilientizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildResilientizabilityAdminRecords,
  buildResilientizabilityAdminStats,
  getResilientizabilityAdminGuidance,
  resolveResilientizabilityAdminActions,
} from './resilientizability-admin.helpers.js'
import { evaluateResilientizabilityRollout } from './resilientizability-rollout.helpers.js'
import { ResilientizabilityStatusService } from './resilientizability-status.service.js'

@Injectable()
export class ResilientizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly resilientizabilityStatusService: ResilientizabilityStatusService,
  ) {}

  getCapabilities() {
    return resilientizabilityCapabilitiesResponseSchema.parse({
      supportsResilientizabilityRollout: true,
      supportsResilientizabilityAdminTools: true,
      supportsMembershipResilientizabilitySignals: true,
      supportsUsageEventResilientizabilitySignals: true,
      guidance: getResilientizabilityRolloutGuidance(),
    })
  }

  async getResilientizabilityRollout() {
    const resilientizabilityTableCoverage =
      await this.resilientizabilityStatusService.getResilientizabilityTableCoverage()

    const rollout = evaluateResilientizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.resilientizabilityStatusService.pingPostgres(),
      existingResilientizabilityTableCount: resilientizabilityTableCoverage.existingResilientizabilityTableCount,
      workspaceMembershipsTableExists: resilientizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: resilientizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: resilientizabilityTableCoverage.billingNotificationsTableExists,
    })

    return resilientizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceResilientizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageResilientizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.resilientizabilityStatusService.getWorkspaceResilientizabilityInventory(
        workspaceId,
      )
    const records = buildResilientizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.resilientizabilityStatusService.pingPostgres()
    const stats = buildResilientizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return resilientizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveResilientizabilityAdminActions(),
      guidance: getResilientizabilityAdminGuidance({ stats }),
    })
  }

  async executeResilientizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_resilientizability_summary'
    },
  ) {
    this.assertCanManageResilientizability(authContext)

    const payload = resilientizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_resilientizability_summary': {
        const summary = await this.getWorkspaceResilientizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return resilientizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed resilientizability summary with ${summary.stats.resilientizabilityPercent}% membership resilientizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageResilientizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production resilientizability tools.',
    })
  }
}
