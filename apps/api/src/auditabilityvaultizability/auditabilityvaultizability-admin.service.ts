import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAuditabilityvaultizabilityRolloutGuidance,
  auditabilityvaultizabilityAdminActionRequestSchema,
  auditabilityvaultizabilityAdminActionResponseSchema,
  auditabilityvaultizabilityAdminSummaryResponseSchema,
  auditabilityvaultizabilityCapabilitiesResponseSchema,
  auditabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditabilityvaultizabilityAdminRecords,
  buildAuditabilityvaultizabilityAdminStats,
  getAuditabilityvaultizabilityAdminGuidance,
  resolveAuditabilityvaultizabilityAdminActions,
} from './auditabilityvaultizability-admin.helpers.js'
import { evaluateAuditabilityvaultizabilityRollout } from './auditabilityvaultizability-rollout.helpers.js'
import { AuditabilityvaultizabilityStatusService } from './auditabilityvaultizability-status.service.js'

@Injectable()
export class AuditabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditabilityvaultizabilityStatusService: AuditabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return auditabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAuditabilityvaultizabilityRollout: true,
      supportsAuditabilityvaultizabilityAdminTools: true,
      supportsMembershipAuditabilityvaultizabilitySignals: true,
      supportsUsageEventAuditabilityvaultizabilitySignals: true,
      guidance: getAuditabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getAuditabilityvaultizabilityRollout() {
    const auditabilityvaultizabilityTableCoverage =
      await this.auditabilityvaultizabilityStatusService.getAuditabilityvaultizabilityTableCoverage()

    const rollout = evaluateAuditabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditabilityvaultizabilityStatusService.pingPostgres(),
      existingAuditabilityvaultizabilityTableCount: auditabilityvaultizabilityTableCoverage.existingAuditabilityvaultizabilityTableCount,
      workspaceMembershipsTableExists: auditabilityvaultizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: auditabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: auditabilityvaultizabilityTableCoverage.billingNotificationsTableExists,
    })

    return auditabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAuditabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.auditabilityvaultizabilityStatusService.getWorkspaceAuditabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAuditabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.auditabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildAuditabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return auditabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditabilityvaultizabilityAdminActions(),
      guidance: getAuditabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAuditabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_auditabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageAuditabilityvaultizability(authContext)

    const payload = auditabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_auditabilityvaultizability_summary': {
        const summary = await this.getWorkspaceAuditabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed auditabilityvaultizability summary with ${summary.stats.auditabilityvaultizabilityPercent}% membership auditabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAuditabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production auditabilityvaultizability tools.',
    })
  }
}
