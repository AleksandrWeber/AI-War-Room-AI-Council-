import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAnnotationizabilityRolloutGuidance,
  annotationizabilityAdminActionRequestSchema,
  annotationizabilityAdminActionResponseSchema,
  annotationizabilityAdminSummaryResponseSchema,
  annotationizabilityCapabilitiesResponseSchema,
  annotationizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAnnotationizabilityAdminRecords,
  buildAnnotationizabilityAdminStats,
  getAnnotationizabilityAdminGuidance,
  resolveAnnotationizabilityAdminActions,
} from './annotationizability-admin.helpers.js'
import { evaluateAnnotationizabilityRollout } from './annotationizability-rollout.helpers.js'
import { AnnotationizabilityStatusService } from './annotationizability-status.service.js'

@Injectable()
export class AnnotationizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly annotationizabilityStatusService: AnnotationizabilityStatusService,
  ) {}

  getCapabilities() {
    return annotationizabilityCapabilitiesResponseSchema.parse({
      supportsAnnotationizabilityRollout: true,
      supportsAnnotationizabilityAdminTools: true,
      supportsBillingInvoiceAnnotationizabilitySignals: true,
      supportsBillingRecordAnnotationizabilitySignals: true,
      guidance: getAnnotationizabilityRolloutGuidance(),
    })
  }

  async getAnnotationizabilityRollout() {
    const annotationizabilityTableCoverage =
      await this.annotationizabilityStatusService.getAnnotationizabilityTableCoverage()

    const rollout = evaluateAnnotationizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.annotationizabilityStatusService.pingPostgres(),
      existingAnnotationizabilityTableCount: annotationizabilityTableCoverage.existingAnnotationizabilityTableCount,
      billingInvoicesTableExists: annotationizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: annotationizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: annotationizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return annotationizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAnnotationizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAnnotationizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.annotationizabilityStatusService.getWorkspaceAnnotationizabilityInventory(
        workspaceId,
      )
    const records = buildAnnotationizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.annotationizabilityStatusService.pingPostgres()
    const stats = buildAnnotationizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return annotationizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAnnotationizabilityAdminActions(),
      guidance: getAnnotationizabilityAdminGuidance({ stats }),
    })
  }

  async executeAnnotationizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_annotationizability_summary'
    },
  ) {
    this.assertCanManageAnnotationizability(authContext)

    const payload = annotationizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_annotationizability_summary': {
        const summary = await this.getWorkspaceAnnotationizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return annotationizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed annotationizability summary with ${summary.stats.annotationizabilityPercent}% billing invoice annotationizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAnnotationizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production annotationizability tools.',
    })
  }
}
