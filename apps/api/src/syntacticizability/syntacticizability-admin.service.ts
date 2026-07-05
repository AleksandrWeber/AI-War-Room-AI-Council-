import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getSyntacticizabilityRolloutGuidance,
  syntacticizabilityAdminActionRequestSchema,
  syntacticizabilityAdminActionResponseSchema,
  syntacticizabilityAdminSummaryResponseSchema,
  syntacticizabilityCapabilitiesResponseSchema,
  syntacticizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildSyntacticizabilityAdminRecords,
  buildSyntacticizabilityAdminStats,
  getSyntacticizabilityAdminGuidance,
  resolveSyntacticizabilityAdminActions,
} from './syntacticizability-admin.helpers.js'
import { evaluateSyntacticizabilityRollout } from './syntacticizability-rollout.helpers.js'
import { SyntacticizabilityStatusService } from './syntacticizability-status.service.js'

@Injectable()
export class SyntacticizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly syntacticizabilityStatusService: SyntacticizabilityStatusService,
  ) {}

  getCapabilities() {
    return syntacticizabilityCapabilitiesResponseSchema.parse({
      supportsSyntacticizabilityRollout: true,
      supportsSyntacticizabilityAdminTools: true,
      supportsBillingWebhookSyntacticizabilitySignals: true,
      supportsBillingRecordSyntacticizabilitySignals: true,
      guidance: getSyntacticizabilityRolloutGuidance(),
    })
  }

  async getSyntacticizabilityRollout() {
    const syntacticizabilityTableCoverage =
      await this.syntacticizabilityStatusService.getSyntacticizabilityTableCoverage()

    const rollout = evaluateSyntacticizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.syntacticizabilityStatusService.pingPostgres(),
      existingSyntacticizabilityTableCount: syntacticizabilityTableCoverage.existingSyntacticizabilityTableCount,
      billingWebhookEventsTableExists: syntacticizabilityTableCoverage.billingWebhookEventsTableExists,
      billingRecordsTableExists: syntacticizabilityTableCoverage.billingRecordsTableExists,
      usageEventsTableExists: syntacticizabilityTableCoverage.usageEventsTableExists,
    })

    return syntacticizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceSyntacticizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageSyntacticizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.syntacticizabilityStatusService.getWorkspaceSyntacticizabilityInventory(
        workspaceId,
      )
    const records = buildSyntacticizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.syntacticizabilityStatusService.pingPostgres()
    const stats = buildSyntacticizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return syntacticizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveSyntacticizabilityAdminActions(),
      guidance: getSyntacticizabilityAdminGuidance({ stats }),
    })
  }

  async executeSyntacticizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_syntacticizability_summary'
    },
  ) {
    this.assertCanManageSyntacticizability(authContext)

    const payload = syntacticizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_syntacticizability_summary': {
        const summary = await this.getWorkspaceSyntacticizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return syntacticizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed syntacticizability summary with ${summary.stats.syntacticizabilityPercent}% billing webhook syntacticizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageSyntacticizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production syntacticizability tools.',
    })
  }
}
