import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCertifiabilityRolloutGuidance,
  certifiabilityAdminActionRequestSchema,
  certifiabilityAdminActionResponseSchema,
  certifiabilityAdminSummaryResponseSchema,
  certifiabilityCapabilitiesResponseSchema,
  certifiabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCertifiabilityAdminRecords,
  buildCertifiabilityAdminStats,
  getCertifiabilityAdminGuidance,
  resolveCertifiabilityAdminActions,
} from './certifiability-admin.helpers.js'
import { evaluateCertifiabilityRollout } from './certifiability-rollout.helpers.js'
import { CertifiabilityStatusService } from './certifiability-status.service.js'

@Injectable()
export class CertifiabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly certifiabilityStatusService: CertifiabilityStatusService,
  ) {}

  getCapabilities() {
    return certifiabilityCapabilitiesResponseSchema.parse({
      supportsCertifiabilityRollout: true,
      supportsCertifiabilityAdminTools: true,
      supportsProviderCredentialCertifiabilitySignals: true,
      supportsModelRegistryCertifiabilitySignals: true,
      guidance: getCertifiabilityRolloutGuidance(),
    })
  }

  async getCertifiabilityRollout() {
    const certifiabilityTableCoverage =
      await this.certifiabilityStatusService.getCertifiabilityTableCoverage()

    const rollout = evaluateCertifiabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.certifiabilityStatusService.pingPostgres(),
      existingCertifiabilityTableCount: certifiabilityTableCoverage.existingCertifiabilityTableCount,
      workspaceProviderCredentialsTableExists: certifiabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: certifiabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: certifiabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return certifiabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCertifiabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCertifiability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.certifiabilityStatusService.getWorkspaceCertifiabilityInventory(
        workspaceId,
      )
    const records = buildCertifiabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.certifiabilityStatusService.pingPostgres()
    const stats = buildCertifiabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return certifiabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCertifiabilityAdminActions(),
      guidance: getCertifiabilityAdminGuidance({ stats }),
    })
  }

  async executeCertifiabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_certifiability_summary'
    },
  ) {
    this.assertCanManageCertifiability(authContext)

    const payload = certifiabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_certifiability_summary': {
        const summary = await this.getWorkspaceCertifiabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return certifiabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed certifiability summary with ${summary.stats.certifiabilityPercent}% provider credential certifiability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCertifiability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production certifiability tools.',
    })
  }
}
