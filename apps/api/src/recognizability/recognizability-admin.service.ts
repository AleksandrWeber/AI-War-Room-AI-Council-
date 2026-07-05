import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getRecognizabilityRolloutGuidance,
  recognizabilityAdminActionRequestSchema,
  recognizabilityAdminActionResponseSchema,
  recognizabilityAdminSummaryResponseSchema,
  recognizabilityCapabilitiesResponseSchema,
  recognizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildRecognizabilityAdminRecords,
  buildRecognizabilityAdminStats,
  getRecognizabilityAdminGuidance,
  resolveRecognizabilityAdminActions,
} from './recognizability-admin.helpers.js'
import { evaluateRecognizabilityRollout } from './recognizability-rollout.helpers.js'
import { RecognizabilityStatusService } from './recognizability-status.service.js'

@Injectable()
export class RecognizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly recognizabilityStatusService: RecognizabilityStatusService,
  ) {}

  getCapabilities() {
    return recognizabilityCapabilitiesResponseSchema.parse({
      supportsRecognizabilityRollout: true,
      supportsRecognizabilityAdminTools: true,
      supportsArtifactRecognizabilitySignals: true,
      supportsWorkflowRecognizabilitySignals: true,
      guidance: getRecognizabilityRolloutGuidance(),
    })
  }

  async getRecognizabilityRollout() {
    const recognizabilityTableCoverage =
      await this.recognizabilityStatusService.getRecognizabilityTableCoverage()

    const rollout = evaluateRecognizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.recognizabilityStatusService.pingPostgres(),
      existingRecognizabilityTableCount: recognizabilityTableCoverage.existingRecognizabilityTableCount,
      artifactsTableExists: recognizabilityTableCoverage.artifactsTableExists,
      runWorkflowsTableExists: recognizabilityTableCoverage.runWorkflowsTableExists,
      billingNotificationsTableExists: recognizabilityTableCoverage.billingNotificationsTableExists,
    })

    return recognizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceRecognizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageRecognizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.recognizabilityStatusService.getWorkspaceRecognizabilityInventory(
        workspaceId,
      )
    const records = buildRecognizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.recognizabilityStatusService.pingPostgres()
    const stats = buildRecognizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return recognizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveRecognizabilityAdminActions(),
      guidance: getRecognizabilityAdminGuidance({ stats }),
    })
  }

  async executeRecognizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_recognizability_summary'
    },
  ) {
    this.assertCanManageRecognizability(authContext)

    const payload = recognizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_recognizability_summary': {
        const summary = await this.getWorkspaceRecognizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return recognizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed recognizability summary with ${summary.stats.recognizabilityPercent}% artifact recognizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageRecognizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production recognizability tools.',
    })
  }
}
