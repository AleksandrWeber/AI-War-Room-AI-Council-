import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttestationizabilityRolloutGuidance,
  attestationizabilityAdminActionRequestSchema,
  attestationizabilityAdminActionResponseSchema,
  attestationizabilityAdminSummaryResponseSchema,
  attestationizabilityCapabilitiesResponseSchema,
  attestationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttestationizabilityAdminRecords,
  buildAttestationizabilityAdminStats,
  getAttestationizabilityAdminGuidance,
  resolveAttestationizabilityAdminActions,
} from './attestationizability-admin.helpers.js'
import { evaluateAttestationizabilityRollout } from './attestationizability-rollout.helpers.js'
import { AttestationizabilityStatusService } from './attestationizability-status.service.js'

@Injectable()
export class AttestationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attestationizabilityStatusService: AttestationizabilityStatusService,
  ) {}

  getCapabilities() {
    return attestationizabilityCapabilitiesResponseSchema.parse({
      supportsAttestationizabilityRollout: true,
      supportsAttestationizabilityAdminTools: true,
      supportsBillingNotificationAttestationizabilitySignals: true,
      supportsBillingWebhookAttestationizabilitySignals: true,
      guidance: getAttestationizabilityRolloutGuidance(),
    })
  }

  async getAttestationizabilityRollout() {
    const attestationizabilityTableCoverage =
      await this.attestationizabilityStatusService.getAttestationizabilityTableCoverage()

    const rollout = evaluateAttestationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attestationizabilityStatusService.pingPostgres(),
      existingAttestationizabilityTableCount: attestationizabilityTableCoverage.existingAttestationizabilityTableCount,
      billingNotificationsTableExists: attestationizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: attestationizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: attestationizabilityTableCoverage.usageEventsTableExists,
    })

    return attestationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttestationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttestationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attestationizabilityStatusService.getWorkspaceAttestationizabilityInventory(
        workspaceId,
      )
    const records = buildAttestationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attestationizabilityStatusService.pingPostgres()
    const stats = buildAttestationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return attestationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttestationizabilityAdminActions(),
      guidance: getAttestationizabilityAdminGuidance({ stats }),
    })
  }

  async executeAttestationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attestationizability_summary'
    },
  ) {
    this.assertCanManageAttestationizability(authContext)

    const payload = attestationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attestationizability_summary': {
        const summary = await this.getWorkspaceAttestationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attestationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attestationizability summary with ${summary.stats.attestationizabilityPercent}% billing notification attestationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttestationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attestationizability tools.',
    })
  }
}
