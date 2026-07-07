import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAudittrailizabilityRolloutGuidance,
  audittrailizabilityAdminActionRequestSchema,
  audittrailizabilityAdminActionResponseSchema,
  audittrailizabilityAdminSummaryResponseSchema,
  audittrailizabilityCapabilitiesResponseSchema,
  audittrailizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAudittrailizabilityAdminRecords,
  buildAudittrailizabilityAdminStats,
  getAudittrailizabilityAdminGuidance,
  resolveAudittrailizabilityAdminActions,
} from './audittrailizability-admin.helpers.js'
import { evaluateAudittrailizabilityRollout } from './audittrailizability-rollout.helpers.js'
import { AudittrailizabilityStatusService } from './audittrailizability-status.service.js'

@Injectable()
export class AudittrailizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly audittrailizabilityStatusService: AudittrailizabilityStatusService,
  ) {}

  getCapabilities() {
    return audittrailizabilityCapabilitiesResponseSchema.parse({
      supportsAudittrailizabilityRollout: true,
      supportsAudittrailizabilityAdminTools: true,
      supportsShieldScanAudittrailizabilitySignals: true,
      supportsProviderCredentialAudittrailizabilitySignals: true,
      guidance: getAudittrailizabilityRolloutGuidance(),
    })
  }

  async getAudittrailizabilityRollout() {
    const audittrailizabilityTableCoverage =
      await this.audittrailizabilityStatusService.getAudittrailizabilityTableCoverage()

    const rollout = evaluateAudittrailizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.audittrailizabilityStatusService.pingPostgres(),
      existingAudittrailizabilityTableCount: audittrailizabilityTableCoverage.existingAudittrailizabilityTableCount,
      shieldScansTableExists: audittrailizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: audittrailizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: audittrailizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return audittrailizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAudittrailizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAudittrailizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.audittrailizabilityStatusService.getWorkspaceAudittrailizabilityInventory(
        workspaceId,
      )
    const records = buildAudittrailizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.audittrailizabilityStatusService.pingPostgres()
    const stats = buildAudittrailizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return audittrailizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAudittrailizabilityAdminActions(),
      guidance: getAudittrailizabilityAdminGuidance({ stats }),
    })
  }

  async executeAudittrailizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_audittrailizability_summary'
    },
  ) {
    this.assertCanManageAudittrailizability(authContext)

    const payload = audittrailizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_audittrailizability_summary': {
        const summary = await this.getWorkspaceAudittrailizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return audittrailizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed audittrailizability summary with ${summary.stats.audittrailizabilityPercent}% shield scan audittrailizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAudittrailizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production audittrailizability tools.',
    })
  }
}
