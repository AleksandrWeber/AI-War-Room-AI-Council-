import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getCertificationizabilityRolloutGuidance,
  certificationizabilityAdminActionRequestSchema,
  certificationizabilityAdminActionResponseSchema,
  certificationizabilityAdminSummaryResponseSchema,
  certificationizabilityCapabilitiesResponseSchema,
  certificationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildCertificationizabilityAdminRecords,
  buildCertificationizabilityAdminStats,
  getCertificationizabilityAdminGuidance,
  resolveCertificationizabilityAdminActions,
} from './certificationizability-admin.helpers.js'
import { evaluateCertificationizabilityRollout } from './certificationizability-rollout.helpers.js'
import { CertificationizabilityStatusService } from './certificationizability-status.service.js'

@Injectable()
export class CertificationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly certificationizabilityStatusService: CertificationizabilityStatusService,
  ) {}

  getCapabilities() {
    return certificationizabilityCapabilitiesResponseSchema.parse({
      supportsCertificationizabilityRollout: true,
      supportsCertificationizabilityAdminTools: true,
      supportsBillingInvoiceCertificationizabilitySignals: true,
      supportsBillingRecordCertificationizabilitySignals: true,
      guidance: getCertificationizabilityRolloutGuidance(),
    })
  }

  async getCertificationizabilityRollout() {
    const certificationizabilityTableCoverage =
      await this.certificationizabilityStatusService.getCertificationizabilityTableCoverage()

    const rollout = evaluateCertificationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.certificationizabilityStatusService.pingPostgres(),
      existingCertificationizabilityTableCount: certificationizabilityTableCoverage.existingCertificationizabilityTableCount,
      billingInvoicesTableExists: certificationizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: certificationizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: certificationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return certificationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceCertificationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageCertificationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.certificationizabilityStatusService.getWorkspaceCertificationizabilityInventory(
        workspaceId,
      )
    const records = buildCertificationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.certificationizabilityStatusService.pingPostgres()
    const stats = buildCertificationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return certificationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveCertificationizabilityAdminActions(),
      guidance: getCertificationizabilityAdminGuidance({ stats }),
    })
  }

  async executeCertificationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_certificationizability_summary'
    },
  ) {
    this.assertCanManageCertificationizability(authContext)

    const payload = certificationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_certificationizability_summary': {
        const summary = await this.getWorkspaceCertificationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return certificationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed certificationizability summary with ${summary.stats.certificationizabilityPercent}% billing invoice certificationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageCertificationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production certificationizability tools.',
    })
  }
}
