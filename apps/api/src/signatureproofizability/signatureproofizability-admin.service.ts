import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSignatureproofizabilityRolloutGuidance,
  signatureproofizabilityAdminActionRequestSchema,
  signatureproofizabilityAdminActionResponseSchema,
  signatureproofizabilityAdminSummaryResponseSchema,
  signatureproofizabilityCapabilitiesResponseSchema,
  signatureproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSignatureproofizabilityAdminRecords,
  buildSignatureproofizabilityAdminStats,
  getSignatureproofizabilityAdminGuidance,
  resolveSignatureproofizabilityAdminActions,
} from './signatureproofizability-admin.helpers.js'
import { evaluateSignatureproofizabilityRollout } from './signatureproofizability-rollout.helpers.js'
import { SignatureproofizabilityStatusService } from './signatureproofizability-status.service.js'

@Injectable()
export class SignatureproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly signatureproofizabilityStatusService: SignatureproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return signatureproofizabilityCapabilitiesResponseSchema.parse({
      supportsSignatureproofizabilityRollout: true,
      supportsSignatureproofizabilityAdminTools: true,
      supportsBillingNotificationSignatureproofizabilitySignals: true,
      supportsBillingWebhookSignatureproofizabilitySignals: true,
      guidance: getSignatureproofizabilityRolloutGuidance(),
    })
  }

  async getSignatureproofizabilityRollout() {
    const signatureproofizabilityTableCoverage =
      await this.signatureproofizabilityStatusService.getSignatureproofizabilityTableCoverage()

    const rollout = evaluateSignatureproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.signatureproofizabilityStatusService.pingPostgres(),
      existingSignatureproofizabilityTableCount: signatureproofizabilityTableCoverage.existingSignatureproofizabilityTableCount,
      billingNotificationsTableExists: signatureproofizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: signatureproofizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: signatureproofizabilityTableCoverage.usageEventsTableExists,
    })

    return signatureproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSignatureproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSignatureproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.signatureproofizabilityStatusService.getWorkspaceSignatureproofizabilityInventory(
        workspaceId,
      )
    const records = buildSignatureproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.signatureproofizabilityStatusService.pingPostgres()
    const stats = buildSignatureproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return signatureproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSignatureproofizabilityAdminActions(),
      guidance: getSignatureproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeSignatureproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_signatureproofizability_summary'
    },
  ) {
    this.assertCanManageSignatureproofizability(authContext)

    const payload = signatureproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_signatureproofizability_summary': {
        const summary = await this.getWorkspaceSignatureproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return signatureproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed signatureproofizability summary with ${summary.stats.signatureproofizabilityPercent}% billing notification signatureproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSignatureproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production signatureproofizability tools.',
    })
  }
}
