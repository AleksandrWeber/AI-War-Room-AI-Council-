import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getImportizabilityRolloutGuidance,
  importizabilityAdminActionRequestSchema,
  importizabilityAdminActionResponseSchema,
  importizabilityAdminSummaryResponseSchema,
  importizabilityCapabilitiesResponseSchema,
  importizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildImportizabilityAdminRecords,
  buildImportizabilityAdminStats,
  getImportizabilityAdminGuidance,
  resolveImportizabilityAdminActions,
} from './importizability-admin.helpers.js'
import { evaluateImportizabilityRollout } from './importizability-rollout.helpers.js'
import { ImportizabilityStatusService } from './importizability-status.service.js'

@Injectable()
export class ImportizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly importizabilityStatusService: ImportizabilityStatusService,
  ) {}

  getCapabilities() {
    return importizabilityCapabilitiesResponseSchema.parse({
      supportsImportizabilityRollout: true,
      supportsImportizabilityAdminTools: true,
      supportsProviderCredentialImportizabilitySignals: true,
      supportsModelRegistryImportizabilitySignals: true,
      guidance: getImportizabilityRolloutGuidance(),
    })
  }

  async getImportizabilityRollout() {
    const importizabilityTableCoverage =
      await this.importizabilityStatusService.getImportizabilityTableCoverage()

    const rollout = evaluateImportizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.importizabilityStatusService.pingPostgres(),
      existingImportizabilityTableCount: importizabilityTableCoverage.existingImportizabilityTableCount,
      workspaceProviderCredentialsTableExists: importizabilityTableCoverage.workspaceProviderCredentialsTableExists,
      modelRegistryEntriesTableExists: importizabilityTableCoverage.modelRegistryEntriesTableExists,
      billingWebhookEventsTableExists: importizabilityTableCoverage.billingWebhookEventsTableExists,
    })

    return importizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceImportizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageImportizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.importizabilityStatusService.getWorkspaceImportizabilityInventory(
        workspaceId,
      )
    const records = buildImportizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.importizabilityStatusService.pingPostgres()
    const stats = buildImportizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return importizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveImportizabilityAdminActions(),
      guidance: getImportizabilityAdminGuidance({ stats }),
    })
  }

  async executeImportizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_importizability_summary'
    },
  ) {
    this.assertCanManageImportizability(authContext)

    const payload = importizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_importizability_summary': {
        const summary = await this.getWorkspaceImportizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return importizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed importizability summary with ${summary.stats.importizabilityPercent}% provider credential importizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageImportizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production importizability tools.',
    })
  }
}
