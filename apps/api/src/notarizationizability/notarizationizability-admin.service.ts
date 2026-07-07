import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getNotarizationizabilityRolloutGuidance,
  notarizationizabilityAdminActionRequestSchema,
  notarizationizabilityAdminActionResponseSchema,
  notarizationizabilityAdminSummaryResponseSchema,
  notarizationizabilityCapabilitiesResponseSchema,
  notarizationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildNotarizationizabilityAdminRecords,
  buildNotarizationizabilityAdminStats,
  getNotarizationizabilityAdminGuidance,
  resolveNotarizationizabilityAdminActions,
} from './notarizationizability-admin.helpers.js'
import { evaluateNotarizationizabilityRollout } from './notarizationizability-rollout.helpers.js'
import { NotarizationizabilityStatusService } from './notarizationizability-status.service.js'

@Injectable()
export class NotarizationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly notarizationizabilityStatusService: NotarizationizabilityStatusService,
  ) {}

  getCapabilities() {
    return notarizationizabilityCapabilitiesResponseSchema.parse({
      supportsNotarizationizabilityRollout: true,
      supportsNotarizationizabilityAdminTools: true,
      supportsMembershipNotarizationizabilitySignals: true,
      supportsUsageEventNotarizationizabilitySignals: true,
      guidance: getNotarizationizabilityRolloutGuidance(),
    })
  }

  async getNotarizationizabilityRollout() {
    const notarizationizabilityTableCoverage =
      await this.notarizationizabilityStatusService.getNotarizationizabilityTableCoverage()

    const rollout = evaluateNotarizationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.notarizationizabilityStatusService.pingPostgres(),
      existingNotarizationizabilityTableCount: notarizationizabilityTableCoverage.existingNotarizationizabilityTableCount,
      workspaceMembershipsTableExists: notarizationizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: notarizationizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: notarizationizabilityTableCoverage.billingNotificationsTableExists,
    })

    return notarizationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceNotarizationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageNotarizationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.notarizationizabilityStatusService.getWorkspaceNotarizationizabilityInventory(
        workspaceId,
      )
    const records = buildNotarizationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.notarizationizabilityStatusService.pingPostgres()
    const stats = buildNotarizationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return notarizationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveNotarizationizabilityAdminActions(),
      guidance: getNotarizationizabilityAdminGuidance({ stats }),
    })
  }

  async executeNotarizationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_notarizationizability_summary'
    },
  ) {
    this.assertCanManageNotarizationizability(authContext)

    const payload = notarizationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_notarizationizability_summary': {
        const summary = await this.getWorkspaceNotarizationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return notarizationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed notarizationizability summary with ${summary.stats.notarizationizabilityPercent}% membership notarizationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageNotarizationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production notarizationizability tools.',
    })
  }
}
