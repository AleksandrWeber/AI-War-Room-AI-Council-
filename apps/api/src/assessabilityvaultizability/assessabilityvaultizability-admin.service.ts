import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAssessabilityvaultizabilityRolloutGuidance,
  assessabilityvaultizabilityAdminActionRequestSchema,
  assessabilityvaultizabilityAdminActionResponseSchema,
  assessabilityvaultizabilityAdminSummaryResponseSchema,
  assessabilityvaultizabilityCapabilitiesResponseSchema,
  assessabilityvaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAssessabilityvaultizabilityAdminRecords,
  buildAssessabilityvaultizabilityAdminStats,
  getAssessabilityvaultizabilityAdminGuidance,
  resolveAssessabilityvaultizabilityAdminActions,
} from './assessabilityvaultizability-admin.helpers.js'
import { evaluateAssessabilityvaultizabilityRollout } from './assessabilityvaultizability-rollout.helpers.js'
import { AssessabilityvaultizabilityStatusService } from './assessabilityvaultizability-status.service.js'

@Injectable()
export class AssessabilityvaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly assessabilityvaultizabilityStatusService: AssessabilityvaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return assessabilityvaultizabilityCapabilitiesResponseSchema.parse({
      supportsAssessabilityvaultizabilityRollout: true,
      supportsAssessabilityvaultizabilityAdminTools: true,
      supportsBillingInvoiceAssessabilityvaultizabilitySignals: true,
      supportsBillingRecordAssessabilityvaultizabilitySignals: true,
      guidance: getAssessabilityvaultizabilityRolloutGuidance(),
    })
  }

  async getAssessabilityvaultizabilityRollout() {
    const assessabilityvaultizabilityTableCoverage =
      await this.assessabilityvaultizabilityStatusService.getAssessabilityvaultizabilityTableCoverage()

    const rollout = evaluateAssessabilityvaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.assessabilityvaultizabilityStatusService.pingPostgres(),
      existingAssessabilityvaultizabilityTableCount: assessabilityvaultizabilityTableCoverage.existingAssessabilityvaultizabilityTableCount,
      billingInvoicesTableExists: assessabilityvaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: assessabilityvaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: assessabilityvaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return assessabilityvaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAssessabilityvaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAssessabilityvaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.assessabilityvaultizabilityStatusService.getWorkspaceAssessabilityvaultizabilityInventory(
        workspaceId,
      )
    const records = buildAssessabilityvaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.assessabilityvaultizabilityStatusService.pingPostgres()
    const stats = buildAssessabilityvaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return assessabilityvaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAssessabilityvaultizabilityAdminActions(),
      guidance: getAssessabilityvaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAssessabilityvaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_assessabilityvaultizability_summary'
    },
  ) {
    this.assertCanManageAssessabilityvaultizability(authContext)

    const payload = assessabilityvaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_assessabilityvaultizability_summary': {
        const summary = await this.getWorkspaceAssessabilityvaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return assessabilityvaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed assessabilityvaultizability summary with ${summary.stats.assessabilityvaultizabilityPercent}% billing invoice assessabilityvaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAssessabilityvaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production assessabilityvaultizability tools.',
    })
  }
}
