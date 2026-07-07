import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getAssurancevaultizabilityRolloutGuidance,
  assurancevaultizabilityAdminActionRequestSchema,
  assurancevaultizabilityAdminActionResponseSchema,
  assurancevaultizabilityAdminSummaryResponseSchema,
  assurancevaultizabilityCapabilitiesResponseSchema,
  assurancevaultizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildAssurancevaultizabilityAdminRecords,
  buildAssurancevaultizabilityAdminStats,
  getAssurancevaultizabilityAdminGuidance,
  resolveAssurancevaultizabilityAdminActions,
} from './assurancevaultizability-admin.helpers.js'
import { evaluateAssurancevaultizabilityRollout } from './assurancevaultizability-rollout.helpers.js'
import { AssurancevaultizabilityStatusService } from './assurancevaultizability-status.service.js'

@Injectable()
export class AssurancevaultizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly assurancevaultizabilityStatusService: AssurancevaultizabilityStatusService,
  ) {}

  getCapabilities() {
    return assurancevaultizabilityCapabilitiesResponseSchema.parse({
      supportsAssurancevaultizabilityRollout: true,
      supportsAssurancevaultizabilityAdminTools: true,
      supportsBillingInvoiceAssurancevaultizabilitySignals: true,
      supportsBillingRecordAssurancevaultizabilitySignals: true,
      guidance: getAssurancevaultizabilityRolloutGuidance(),
    })
  }

  async getAssurancevaultizabilityRollout() {
    const assurancevaultizabilityTableCoverage =
      await this.assurancevaultizabilityStatusService.getAssurancevaultizabilityTableCoverage()

    const rollout = evaluateAssurancevaultizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.assurancevaultizabilityStatusService.pingPostgres(),
      existingAssurancevaultizabilityTableCount: assurancevaultizabilityTableCoverage.existingAssurancevaultizabilityTableCount,
      billingInvoicesTableExists: assurancevaultizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: assurancevaultizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: assurancevaultizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return assurancevaultizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceAssurancevaultizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageAssurancevaultizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.assurancevaultizabilityStatusService.getWorkspaceAssurancevaultizabilityInventory(
        workspaceId,
      )
    const records = buildAssurancevaultizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.assurancevaultizabilityStatusService.pingPostgres()
    const stats = buildAssurancevaultizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return assurancevaultizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveAssurancevaultizabilityAdminActions(),
      guidance: getAssurancevaultizabilityAdminGuidance({ stats }),
    })
  }

  async executeAssurancevaultizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_assurancevaultizability_summary'
    },
  ) {
    this.assertCanManageAssurancevaultizability(authContext)

    const payload = assurancevaultizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_assurancevaultizability_summary': {
        const summary = await this.getWorkspaceAssurancevaultizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return assurancevaultizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed assurancevaultizability summary with ${summary.stats.assurancevaultizabilityPercent}% billing invoice assurancevaultizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageAssurancevaultizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production assurancevaultizability tools.',
    })
  }
}
