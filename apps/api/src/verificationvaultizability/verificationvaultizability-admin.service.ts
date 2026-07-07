import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getVerificationvaultizabilityRolloutGuidance,
  verificationvaultizabilityAdminActionRequestSchema,
  verificationvaultizabilityAdminActionResponseSchema,
  verificationvaultizabilityAdminSummaryResponseSchema,
  verificationvaultizabilityCapabilitiesResponseSchema,
  verificationvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildVerificationvaultizabilityAdminRecords,
  buildVerificationvaultizabilityAdminStats,
  getVerificationvaultizabilityAdminGuidance,
  resolveVerificationvaultizabilityAdminActions,
} from './verificationvaultizability-admin.helpers.js'
import { evaluateVerificationvaultizabilityRollout } from './verificationvaultizability-rollout.helpers.js'
import { VerificationvaultizabilityStatusService } from './verificationvaultizability-status.service.js'

@Injectable()
export class VerificationvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly verificationvaultizabilityStatusService: VerificationvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return verificationvaultizabilityCapabilitiesResponseSchema.parse({
      supportsVerificationvaultizabilityRollout: true,
      supportsVerificationvaultizabilityAdminTools: true,
      supportsShieldScanVerificationvaultizabilitySignals: true,
      supportsProviderCredentialVerificationvaultizabilitySignals: true,
      guidance: getVerificationvaultizabilityRolloutGuidance(),
    })
  }

  async getVerificationvaultizabilityRollout() {
    const verificationvaultizabilityTableCoverage =
      await this.verificationvaultizabilityStatusService.getVerificationvaultizabilityTableCoverage()

    const rollout = evaluateVerificationvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.verificationvaultizabilityStatusService.pingPostgres(),
      existingVerificationvaultizabilityTableCount: verificationvaultizabilityTableCoverage.existingVerificationvaultizabilityTableCount,
      shieldScansTableExists: verificationvaultizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: verificationvaultizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: verificationvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return verificationvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceVerificationvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageVerificationvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.verificationvaultizabilityStatusService.getWorkspaceVerificationvaultizabilityInventory(
        workspaceId,
      )
    const records = buildVerificationvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.verificationvaultizabilityStatusService.pingPostgres()
    const stats = buildVerificationvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return verificationvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveVerificationvaultizabilityAdminActions(),
      guidance: getVerificationvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeVerificationvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_verificationvaultizability_summary'
    },
  ) {
    this.assertCanManageVerificationvaultizability(authContext)

    const payload = verificationvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_verificationvaultizability_summary': {
        const summary = await this.getWorkspaceVerificationvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return verificationvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed verificationvaultizability summary with ${summary.stats.verificationvaultizabilityPercent}% shield scan verificationvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageVerificationvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production verificationvaultizability tools.',
    })
  }
}
