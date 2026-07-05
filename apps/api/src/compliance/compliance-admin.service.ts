import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  complianceAdminActionRequestSchema,
  complianceAdminActionResponseSchema,
  complianceAdminSummaryResponseSchema,
  complianceCapabilitiesResponseSchema,
  complianceRolloutResponseSchema,
  DEFAULT_APP_ENCRYPTION_KEY,
  getComplianceRolloutGuidance,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildComplianceAdminRecords,
  buildComplianceAdminStats,
  getComplianceAdminGuidance,
  resolveComplianceAdminActions,
} from './compliance-admin.helpers.js'
import { evaluateComplianceRollout } from './compliance-rollout.helpers.js'
import { ComplianceStatusService } from './compliance-status.service.js'

@Injectable()
export class ComplianceAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly complianceStatusService: ComplianceStatusService,
  ) {}

  getCapabilities() {
    return complianceCapabilitiesResponseSchema.parse({
      supportsComplianceRollout: true,
      supportsComplianceAdminTools: true,
      supportsPolicyTableCoverage: true,
      supportsEncryptionAttestation: true,
      guidance: getComplianceRolloutGuidance(),
    })
  }

  async getComplianceRollout() {
    const policyTableCoverage =
      await this.complianceStatusService.getPolicyTableCoverage()
    const rollout = evaluateComplianceRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.complianceStatusService.pingPostgres(),
      existingPolicyTableCount: policyTableCoverage.existingPolicyTableCount,
      encryptionKeyConfigured: this.isEncryptionKeyConfigured(),
    })

    return complianceRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceComplianceAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCompliance(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventory =
      await this.complianceStatusService.getWorkspaceComplianceInventory(
        workspaceId,
      )
    const records = buildComplianceAdminRecords(inventory)
    const postgresConnectivity = await this.complianceStatusService.pingPostgres()
    const encryptionKeyConfigured = this.isEncryptionKeyConfigured()
    const stats = buildComplianceAdminStats({
      records,
      postgresConnectivity,
      encryptionKeyConfigured,
    })

    return complianceAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveComplianceAdminActions(),
      guidance: getComplianceAdminGuidance({ stats }),
    })
  }

  async executeComplianceAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_compliance_summary'
    },
  ) {
    this.assertCanManageCompliance(authContext)

    const payload = complianceAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_compliance_summary': {
        const summary = await this.getWorkspaceComplianceAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return complianceAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed compliance summary with ${summary.stats.totalRecords} attestation record(s) across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private isEncryptionKeyConfigured() {
    const encryptionKey = this.configService.get('APP_ENCRYPTION_KEY', {
      infer: true,
    })

    return encryptionKey !== DEFAULT_APP_ENCRYPTION_KEY
  }

  private assertCanManageCompliance(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production compliance tools.',
    })
  }
}
