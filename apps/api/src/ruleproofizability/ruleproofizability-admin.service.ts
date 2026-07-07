import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRuleproofizabilityRolloutGuidance,
  ruleproofizabilityAdminActionRequestSchema,
  ruleproofizabilityAdminActionResponseSchema,
  ruleproofizabilityAdminSummaryResponseSchema,
  ruleproofizabilityCapabilitiesResponseSchema,
  ruleproofizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRuleproofizabilityAdminRecords,
  buildRuleproofizabilityAdminStats,
  getRuleproofizabilityAdminGuidance,
  resolveRuleproofizabilityAdminActions,
} from './ruleproofizability-admin.helpers.js'
import { evaluateRuleproofizabilityRollout } from './ruleproofizability-rollout.helpers.js'
import { RuleproofizabilityStatusService } from './ruleproofizability-status.service.js'

@Injectable()
export class RuleproofizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly ruleproofizabilityStatusService: RuleproofizabilityStatusService,
  ) {}

  getCapabilities() {
    return ruleproofizabilityCapabilitiesResponseSchema.parse({
      supportsRuleproofizabilityRollout: true,
      supportsRuleproofizabilityAdminTools: true,
      supportsBillingInvoiceRuleproofizabilitySignals: true,
      supportsBillingRecordRuleproofizabilitySignals: true,
      guidance: getRuleproofizabilityRolloutGuidance(),
    })
  }

  async getRuleproofizabilityRollout() {
    const ruleproofizabilityTableCoverage =
      await this.ruleproofizabilityStatusService.getRuleproofizabilityTableCoverage()

    const rollout = evaluateRuleproofizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.ruleproofizabilityStatusService.pingPostgres(),
      existingRuleproofizabilityTableCount: ruleproofizabilityTableCoverage.existingRuleproofizabilityTableCount,
      billingInvoicesTableExists: ruleproofizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: ruleproofizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: ruleproofizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return ruleproofizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRuleproofizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRuleproofizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.ruleproofizabilityStatusService.getWorkspaceRuleproofizabilityInventory(
        workspaceId,
      )
    const records = buildRuleproofizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.ruleproofizabilityStatusService.pingPostgres()
    const stats = buildRuleproofizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return ruleproofizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRuleproofizabilityAdminActions(),
      guidance: getRuleproofizabilityAdminGuidance({ stats }),
    })
  }

  async executeRuleproofizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_ruleproofizability_summary'
    },
  ) {
    this.assertCanManageRuleproofizability(authContext)

    const payload = ruleproofizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_ruleproofizability_summary': {
        const summary = await this.getWorkspaceRuleproofizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return ruleproofizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed ruleproofizability summary with ${summary.stats.ruleproofizabilityPercent}% billing invoice ruleproofizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRuleproofizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production ruleproofizability tools.',
    })
  }
}
