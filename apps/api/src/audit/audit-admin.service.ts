import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  auditTrailAdminActionRequestSchema,
  auditTrailAdminActionResponseSchema,
  auditTrailAdminSummaryResponseSchema,
  auditTrailCapabilitiesResponseSchema,
  auditTrailRolloutResponseSchema,
  getAuditTrailRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAuditTrailAdminRecords,
  buildAuditTrailAdminStats,
  getAuditTrailAdminGuidance,
  resolveAuditTrailAdminActions,
} from './audit-trail-admin.helpers.js'
import { evaluateAuditTrailRollout } from './audit-trail-rollout.helpers.js'
import { AuditStatusService } from './audit-status.service.js'

@Injectable()
export class AuditAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly auditStatusService: AuditStatusService,
  ) {}

  getCapabilities() {
    return auditTrailCapabilitiesResponseSchema.parse({
      supportsAuditTrailRollout: true,
      supportsAuditTrailAdminTools: true,
      supportsWorkspaceAuditExport: true,
      supportsPersistentAuditTables: true,
      guidance: getAuditTrailRolloutGuidance(),
    })
  }

  async getAuditTrailRollout() {
    const auditTableCoverage = await this.auditStatusService.getAuditTableCoverage()
    const rollout = evaluateAuditTrailRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.auditStatusService.pingPostgres(),
      existingAuditTableCount: auditTableCoverage.existingAuditTableCount,
      supportsWorkspaceAuditExport: true,
    })

    return auditTrailRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAuditAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAudit(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventory =
      await this.auditStatusService.getWorkspaceAuditInventory(workspaceId)
    const records = buildAuditTrailAdminRecords(inventory)
    const postgresConnectivity = await this.auditStatusService.pingPostgres()
    const stats = buildAuditTrailAdminStats({
      records,
      postgresConnectivity,
    })

    return auditTrailAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAuditTrailAdminActions(),
      guidance: getAuditTrailAdminGuidance({ stats }),
    })
  }

  async executeAuditAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_audit_summary'
    },
  ) {
    this.assertCanManageAudit(authContext)

    const payload = auditTrailAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_audit_summary': {
        const summary = await this.getWorkspaceAuditAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return auditTrailAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed audit summary with ${summary.stats.totalRecords} audit record(s) across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAudit(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production audit trail tools.',
    })
  }
}
