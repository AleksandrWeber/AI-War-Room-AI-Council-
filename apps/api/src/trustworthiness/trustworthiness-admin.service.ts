import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getTrustworthinessRolloutGuidance,
  trustworthinessAdminActionRequestSchema,
  trustworthinessAdminActionResponseSchema,
  trustworthinessAdminSummaryResponseSchema,
  trustworthinessCapabilitiesResponseSchema,
  trustworthinessRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildTrustworthinessAdminRecords,
  buildTrustworthinessAdminStats,
  getTrustworthinessAdminGuidance,
  resolveTrustworthinessAdminActions,
} from './trustworthiness-admin.helpers.js'
import { evaluateTrustworthinessRollout } from './trustworthiness-rollout.helpers.js'
import { TrustworthinessStatusService } from './trustworthiness-status.service.js'

@Injectable()
export class TrustworthinessAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly trustworthinessStatusService: TrustworthinessStatusService,
  ) {}

  getCapabilities() {
    return trustworthinessCapabilitiesResponseSchema.parse({
      supportsTrustworthinessRollout: true,
      supportsTrustworthinessAdminTools: true,
      supportsShieldScanTrustworthinessSignals: true,
      supportsProviderCredentialTrustworthinessSignals: true,
      guidance: getTrustworthinessRolloutGuidance(),
    })
  }

  async getTrustworthinessRollout() {
    const trustworthinessTableCoverage =
      await this.trustworthinessStatusService.getTrustworthinessTableCoverage()

    const rollout = evaluateTrustworthinessRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.trustworthinessStatusService.pingPostgres(),
      existingTrustworthinessTableCount: trustworthinessTableCoverage.existingTrustworthinessTableCount,
      shieldScansTableExists: trustworthinessTableCoverage.shieldScansTableExists,
      workspaceProviderCredentialsTableExists: trustworthinessTableCoverage.workspaceProviderCredentialsTableExists,
      billingWebhookEventsTableExists: trustworthinessTableCoverage.billingWebhookEventsTableExists,
    })

    return trustworthinessRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceTrustworthinessAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageTrustworthiness(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.trustworthinessStatusService.getWorkspaceTrustworthinessInventory(
        workspaceId,
      )
    const records = buildTrustworthinessAdminRecords(inventoryItems)
    const postgresConnectivity = await this.trustworthinessStatusService.pingPostgres()
    const stats = buildTrustworthinessAdminStats({
      records,
      postgresConnectivity,
    })

    return trustworthinessAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveTrustworthinessAdminActions(),
      guidance: getTrustworthinessAdminGuidance({ stats }),
    })
  }

  async executeTrustworthinessAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_trustworthiness_summary'
    },
  ) {
    this.assertCanManageTrustworthiness(authContext)

    const payload = trustworthinessAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_trustworthiness_summary': {
        const summary = await this.getWorkspaceTrustworthinessAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return trustworthinessAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed trustworthiness summary with ${summary.stats.trustworthinessPercent}% shield scan trustworthiness across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageTrustworthiness(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production trustworthiness tools.',
    })
  }
}
