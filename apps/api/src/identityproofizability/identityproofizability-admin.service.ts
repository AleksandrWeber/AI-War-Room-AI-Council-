import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIdentityproofizabilityRolloutGuidance,
  identityproofizabilityAdminActionRequestSchema,
  identityproofizabilityAdminActionResponseSchema,
  identityproofizabilityAdminSummaryResponseSchema,
  identityproofizabilityCapabilitiesResponseSchema,
  identityproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildIdentityproofizabilityAdminRecords,
  buildIdentityproofizabilityAdminStats,
  getIdentityproofizabilityAdminGuidance,
  resolveIdentityproofizabilityAdminActions,
} from './identityproofizability-admin.helpers.js'
import { evaluateIdentityproofizabilityRollout } from './identityproofizability-rollout.helpers.js'
import { IdentityproofizabilityStatusService } from './identityproofizability-status.service.js'

@Injectable()
export class IdentityproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly identityproofizabilityStatusService: IdentityproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return identityproofizabilityCapabilitiesResponseSchema.parse({
      supportsIdentityproofizabilityRollout: true,
      supportsIdentityproofizabilityAdminTools: true,
      supportsBillingInvoiceIdentityproofizabilitySignals: true,
      supportsBillingRecordIdentityproofizabilitySignals: true,
      guidance: getIdentityproofizabilityRolloutGuidance(),
    })
  }

  async getIdentityproofizabilityRollout() {
    const identityproofizabilityTableCoverage =
      await this.identityproofizabilityStatusService.getIdentityproofizabilityTableCoverage()

    const rollout = evaluateIdentityproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.identityproofizabilityStatusService.pingPostgres(),
      existingIdentityproofizabilityTableCount: identityproofizabilityTableCoverage.existingIdentityproofizabilityTableCount,
      billingInvoicesTableExists: identityproofizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: identityproofizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: identityproofizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return identityproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIdentityproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIdentityproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.identityproofizabilityStatusService.getWorkspaceIdentityproofizabilityInventory(
        workspaceId,
      )
    const records = buildIdentityproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.identityproofizabilityStatusService.pingPostgres()
    const stats = buildIdentityproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return identityproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIdentityproofizabilityAdminActions(),
      guidance: getIdentityproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeIdentityproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_identityproofizability_summary'
    },
  ) {
    this.assertCanManageIdentityproofizability(authContext)

    const payload = identityproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_identityproofizability_summary': {
        const summary = await this.getWorkspaceIdentityproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return identityproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed identityproofizability summary with ${summary.stats.identityproofizabilityPercent}% billing invoice identityproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageIdentityproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production identityproofizability tools.',
    })
  }
}
