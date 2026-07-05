import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDiagnosabilizabilityRolloutGuidance,
  diagnosabilizabilityAdminActionRequestSchema,
  diagnosabilizabilityAdminActionResponseSchema,
  diagnosabilizabilityAdminSummaryResponseSchema,
  diagnosabilizabilityCapabilitiesResponseSchema,
  diagnosabilizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDiagnosabilizabilityAdminRecords,
  buildDiagnosabilizabilityAdminStats,
  getDiagnosabilizabilityAdminGuidance,
  resolveDiagnosabilizabilityAdminActions,
} from './diagnosabilizability-admin.helpers.js'
import { evaluateDiagnosabilizabilityRollout } from './diagnosabilizability-rollout.helpers.js'
import { DiagnosabilizabilityStatusService } from './diagnosabilizability-status.service.js'

@Injectable()
export class DiagnosabilizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly diagnosabilizabilityStatusService: DiagnosabilizabilityStatusService,
  ) {}

  getCapabilities() {
    return diagnosabilizabilityCapabilitiesResponseSchema.parse({
      supportsDiagnosabilizabilityRollout: true,
      supportsDiagnosabilizabilityAdminTools: true,
      supportsBillingInvoiceDiagnosabilizabilitySignals: true,
      supportsBillingRecordDiagnosabilizabilitySignals: true,
      guidance: getDiagnosabilizabilityRolloutGuidance(),
    })
  }

  async getDiagnosabilizabilityRollout() {
    const diagnosabilizabilityTableCoverage =
      await this.diagnosabilizabilityStatusService.getDiagnosabilizabilityTableCoverage()

    const rollout = evaluateDiagnosabilizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.diagnosabilizabilityStatusService.pingPostgres(),
      existingDiagnosabilizabilityTableCount: diagnosabilizabilityTableCoverage.existingDiagnosabilizabilityTableCount,
      billingInvoicesTableExists: diagnosabilizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: diagnosabilizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: diagnosabilizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return diagnosabilizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDiagnosabilizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDiagnosabilizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.diagnosabilizabilityStatusService.getWorkspaceDiagnosabilizabilityInventory(
        workspaceId,
      )
    const records = buildDiagnosabilizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.diagnosabilizabilityStatusService.pingPostgres()
    const stats = buildDiagnosabilizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return diagnosabilizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDiagnosabilizabilityAdminActions(),
      guidance: getDiagnosabilizabilityAdminGuidance({ stats }),
    })
  }

  async executeDiagnosabilizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_diagnosabilizability_summary'
    },
  ) {
    this.assertCanManageDiagnosabilizability(authContext)

    const payload = diagnosabilizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_diagnosabilizability_summary': {
        const summary = await this.getWorkspaceDiagnosabilizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return diagnosabilizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed diagnosabilizability summary with ${summary.stats.diagnosabilizabilityPercent}% billing invoice diagnosabilizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDiagnosabilizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production diagnosabilizability tools.',
    })
  }
}
