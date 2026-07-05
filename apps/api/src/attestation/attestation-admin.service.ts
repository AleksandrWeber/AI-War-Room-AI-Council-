import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAttestationRolloutGuidance,
  attestationAdminActionRequestSchema,
  attestationAdminActionResponseSchema,
  attestationAdminSummaryResponseSchema,
  attestationCapabilitiesResponseSchema,
  attestationRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAttestationAdminRecords,
  buildAttestationAdminStats,
  getAttestationAdminGuidance,
  resolveAttestationAdminActions,
} from './attestation-admin.helpers.js'
import { evaluateAttestationRollout } from './attestation-rollout.helpers.js'
import { AttestationStatusService } from './attestation-status.service.js'

@Injectable()
export class AttestationAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly attestationStatusService: AttestationStatusService,
  ) {}

  getCapabilities() {
    return attestationCapabilitiesResponseSchema.parse({
      supportsAttestationRollout: true,
      supportsAttestationAdminTools: true,
      supportsModelRegistryAttestationSignals: true,
      supportsProviderCredentialAttestationSignals: true,
      guidance: getAttestationRolloutGuidance(),
    })
  }

  async getAttestationRollout() {
    const attestationTableCoverage =
      await this.attestationStatusService.getAttestationTableCoverage()

    const rollout = evaluateAttestationRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.attestationStatusService.pingPostgres(),
      existingAttestationTableCount: attestationTableCoverage.existingAttestationTableCount,
      modelRegistryEntriesTableExists: attestationTableCoverage.modelRegistryEntriesTableExists,
      providerCredentialsTableExists: attestationTableCoverage.providerCredentialsTableExists,
      modelHealthEventsTableExists: attestationTableCoverage.modelHealthEventsTableExists,
    })

    return attestationRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAttestationAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAttestation(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.attestationStatusService.getWorkspaceAttestationInventory(
        workspaceId,
      )
    const records = buildAttestationAdminRecords(inventoryItems)
    const postgresConnectivity = await this.attestationStatusService.pingPostgres()
    const stats = buildAttestationAdminStats({
      records,
      postgresConnectivity,
    })

    return attestationAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAttestationAdminActions(),
      guidance: getAttestationAdminGuidance({ stats }),
    })
  }

  async executeAttestationAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_attestation_summary'
    },
  ) {
    this.assertCanManageAttestation(authContext)

    const payload = attestationAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_attestation_summary': {
        const summary = await this.getWorkspaceAttestationAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return attestationAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed attestation summary with ${summary.stats.attestationPercent}% provider credential attestation across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAttestation(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production attestation tools.',
    })
  }
}
