import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttestjournalizabilityRolloutGuidance,
  attestjournalizabilityAdminActionRequestSchema,
  attestjournalizabilityAdminActionResponseSchema,
  attestjournalizabilityAdminSummaryResponseSchema,
  attestjournalizabilityCapabilitiesResponseSchema,
  attestjournalizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttestjournalizabilityAdminRecords,
  buildAttestjournalizabilityAdminStats,
  getAttestjournalizabilityAdminGuidance,
  resolveAttestjournalizabilityAdminActions,
} from './attestjournalizability-admin.helpers.js'
import { evaluateAttestjournalizabilityRollout } from './attestjournalizability-rollout.helpers.js'
import { AttestjournalizabilityStatusService } from './attestjournalizability-status.service.js'

@Injectable()
export class AttestjournalizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attestjournalizabilityStatusService: AttestjournalizabilityStatusService,
  ) {}

  getCapabilities() {
    return attestjournalizabilityCapabilitiesResponseSchema.parse({
      supportsAttestjournalizabilityRollout: true,
      supportsAttestjournalizabilityAdminTools: true,
      supportsShieldScanAttestjournalizabilitySignals: true,
      supportsProviderCredentialAttestjournalizabilitySignals: true,
      guidance: getAttestjournalizabilityRolloutGuidance(),
    })
  }

  async getAttestjournalizabilityRollout() {
    const attestjournalizabilityTableCoverage =
      await this.attestjournalizabilityStatusService.getAttestjournalizabilityTableCoverage()

    const rollout = evaluateAttestjournalizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attestjournalizabilityStatusService.pingPostgres(),
      existingAttestjournalizabilityTableCount: attestjournalizabilityTableCoverage.existingAttestjournalizabilityTableCount,
      shieldScansTableExists: attestjournalizabilityTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: attestjournalizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: attestjournalizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return attestjournalizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttestjournalizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttestjournalizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attestjournalizabilityStatusService.getWorkspaceAttestjournalizabilityInventory(
        workspaceId,
      )
    const records = buildAttestjournalizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attestjournalizabilityStatusService.pingPostgres()
    const stats = buildAttestjournalizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return attestjournalizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttestjournalizabilityAdminActions(),
      guidance: getAttestjournalizabilityAdminGuidance({ stats }),
    })
  }

  async executeAttestjournalizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attestjournalizability_summary'
    },
  ) {
    this.assertCanManageAttestjournalizability(authContext)

    const payload = attestjournalizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attestjournalizability_summary': {
        const summary = await this.getWorkspaceAttestjournalizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attestjournalizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attestjournalizability summary with ${summary.stats.attestjournalizabilityPercent}% shield scan attestjournalizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttestjournalizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attestjournalizability tools.',
    })
  }
}
