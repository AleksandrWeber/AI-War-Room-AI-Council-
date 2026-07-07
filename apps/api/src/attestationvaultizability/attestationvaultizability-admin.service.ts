import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttestationvaultizabilityRolloutGuidance,
  attestationvaultizabilityAdminActionRequestSchema,
  attestationvaultizabilityAdminActionResponseSchema,
  attestationvaultizabilityAdminSummaryResponseSchema,
  attestationvaultizabilityCapabilitiesResponseSchema,
  attestationvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttestationvaultizabilityAdminRecords,
  buildAttestationvaultizabilityAdminStats,
  getAttestationvaultizabilityAdminGuidance,
  resolveAttestationvaultizabilityAdminActions,
} from './attestationvaultizability-admin.helpers.js'
import { evaluateAttestationvaultizabilityRollout } from './attestationvaultizability-rollout.helpers.js'
import { AttestationvaultizabilityStatusService } from './attestationvaultizability-status.service.js'

@Injectable()
export class AttestationvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attestationvaultizabilityStatusService: AttestationvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return attestationvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAttestationvaultizabilityRollout: true,
      supportsAttestationvaultizabilityAdminTools: true,
      supportsBillingNotificationAttestationvaultizabilitySignals: true,
      supportsBillingWebhookAttestationvaultizabilitySignals: true,
      guidance: getAttestationvaultizabilityRolloutGuidance(),
    })
  }

  async getAttestationvaultizabilityRollout() {
    const attestationvaultizabilityTableCoverage =
      await this.attestationvaultizabilityStatusService.getAttestationvaultizabilityTableCoverage()

    const rollout = evaluateAttestationvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attestationvaultizabilityStatusService.pingPostgres(),
      existingAttestationvaultizabilityTableCount: attestationvaultizabilityTableCoverage.existingAttestationvaultizabilityTableCount,
      billingNotificationsTableExists: attestationvaultizabilityTableCoverage.billingNotificationsTableExists,
      billingWebhookEventsTableExists: attestationvaultizabilityTableCoverage.billingWebhookEventsTableExists,
      usageEventsTableExists: attestationvaultizabilityTableCoverage.usageEventsTableExists,
    })

    return attestationvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttestationvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttestationvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attestationvaultizabilityStatusService.getWorkspaceAttestationvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAttestationvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attestationvaultizabilityStatusService.pingPostgres()
    const stats = buildAttestationvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return attestationvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttestationvaultizabilityAdminActions(),
      guidance: getAttestationvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAttestationvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attestationvaultizability_summary'
    },
  ) {
    this.assertCanManageAttestationvaultizability(authContext)

    const payload = attestationvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attestationvaultizability_summary': {
        const summary = await this.getWorkspaceAttestationvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attestationvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attestationvaultizability summary with ${summary.stats.attestationvaultizabilityPercent}% billing notification attestationvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttestationvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attestationvaultizability tools.',
    })
  }
}
