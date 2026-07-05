import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getVocabularizabilityRolloutGuidance,
  vocabularizabilityAdminActionRequestSchema,
  vocabularizabilityAdminActionResponseSchema,
  vocabularizabilityAdminSummaryResponseSchema,
  vocabularizabilityCapabilitiesResponseSchema,
  vocabularizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildVocabularizabilityAdminRecords,
  buildVocabularizabilityAdminStats,
  getVocabularizabilityAdminGuidance,
  resolveVocabularizabilityAdminActions,
} from './vocabularizability-admin.helpers.js'
import { evaluateVocabularizabilityRollout } from './vocabularizability-rollout.helpers.js'
import { VocabularizabilityStatusService } from './vocabularizability-status.service.js'

@Injectable()
export class VocabularizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly vocabularizabilityStatusService: VocabularizabilityStatusService,
  ) {}

  getCapabilities() {
    return vocabularizabilityCapabilitiesResponseSchema.parse({
      supportsVocabularizabilityRollout: true,
      supportsVocabularizabilityAdminTools: true,
      supportsBillingInvoiceVocabularizabilitySignals: true,
      supportsBillingRecordVocabularizabilitySignals: true,
      guidance: getVocabularizabilityRolloutGuidance(),
    })
  }

  async getVocabularizabilityRollout() {
    const vocabularizabilityTableCoverage =
      await this.vocabularizabilityStatusService.getVocabularizabilityTableCoverage()

    const rollout = evaluateVocabularizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.vocabularizabilityStatusService.pingPostgres(),
      existingVocabularizabilityTableCount: vocabularizabilityTableCoverage.existingVocabularizabilityTableCount,
      billingInvoicesTableExists: vocabularizabilityTableCoverage.billingInvoicesTableExists,
      billingRecordsTableExists: vocabularizabilityTableCoverage.billingRecordsTableExists,
      billingWebhookEventsTableExists: vocabularizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return vocabularizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceVocabularizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageVocabularizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.vocabularizabilityStatusService.getWorkspaceVocabularizabilityInventory(
        workspaceId,
      )
    const records = buildVocabularizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.vocabularizabilityStatusService.pingPostgres()
    const stats = buildVocabularizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return vocabularizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveVocabularizabilityAdminActions(),
      guidance: getVocabularizabilityAdminGuidance({ stats }),
    })
  }

  async executeVocabularizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_vocabularizability_summary'
    },
  ) {
    this.assertCanManageVocabularizability(authContext)

    const payload = vocabularizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_vocabularizability_summary': {
        const summary = await this.getWorkspaceVocabularizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return vocabularizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed vocabularizability summary with ${summary.stats.vocabularizabilityPercent}% billing invoice vocabularizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageVocabularizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production vocabularizability tools.',
    })
  }
}
