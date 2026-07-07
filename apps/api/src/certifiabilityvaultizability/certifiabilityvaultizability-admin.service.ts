import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCertifiabilityvaultizabilityRolloutGuidance,
  certifiabilityvaultizabilityAdminActionRequestSchema,
  certifiabilityvaultizabilityAdminActionResponseSchema,
  certifiabilityvaultizabilityAdminSummaryResponseSchema,
  certifiabilityvaultizabilityCapabilitiesResponseSchema,
  certifiabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCertifiabilityvaultizabilityAdminRecords,
  buildCertifiabilityvaultizabilityAdminStats,
  getCertifiabilityvaultizabilityAdminGuidance,
  resolveCertifiabilityvaultizabilityAdminActions,
} from './certifiabilityvaultizability-admin.helpers.js'
import { evaluateCertifiabilityvaultizabilityRollout } from './certifiabilityvaultizability-rollout.helpers.js'
import { CertifiabilityvaultizabilityStatusService } from './certifiabilityvaultizability-status.service.js'

@Injectable()
export class CertifiabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly certifiabilityvaultizabilityStatusService: CertifiabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return certifiabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsCertifiabilityvaultizabilityRollout: true,
      supportsCertifiabilityvaultizabilityAdminTools: true,
      supportsIdempotencyKeyCertifiabilityvaultizabilitySignals: true,
      supportsUsageEventCertifiabilityvaultizabilitySignals: true,
      guidance: getCertifiabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getCertifiabilityvaultizabilityRollout() {
    const certifiabilityvaultizabilityTableCoverage =
      await this.certifiabilityvaultizabilityStatusService.getCertifiabilityvaultizabilityTableCoverage()

    const rollout = evaluateCertifiabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.certifiabilityvaultizabilityStatusService.pingPostgres(),
      existingCertifiabilityvaultizabilityTableCount: certifiabilityvaultizabilityTableCoverage.existingCertifiabilityvaultizabilityTableCount,
      idempotencyKeysTableExists: certifiabilityvaultizabilityTableCoverage.idempotencyKeysTableExists,
      usageEventsTableExists: certifiabilityvaultizabilityTableCoverage.usageEventsTableExists,
      billingWebhookEventsTableExists: certifiabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return certifiabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCertifiabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCertifiabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.certifiabilityvaultizabilityStatusService.getWorkspaceCertifiabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildCertifiabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.certifiabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildCertifiabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return certifiabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCertifiabilityvaultizabilityAdminActions(),
      guidance: getCertifiabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeCertifiabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_certifiabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageCertifiabilityvaultizability(authContext)

    const payload = certifiabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_certifiabilityvaultizability_summary': {
        const summary = await this.getWorkspaceCertifiabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return certifiabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed certifiabilityvaultizability summary with ${summary.stats.certifiabilityvaultizabilityPercent}% idempotency key certifiabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCertifiabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production certifiabilityvaultizability tools.',
    })
  }
}
