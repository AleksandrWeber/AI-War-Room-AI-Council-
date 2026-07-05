import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getDocumentizabilityRolloutGuidance,
  documentizabilityAdminActionRequestSchema,
  documentizabilityAdminActionResponseSchema,
  documentizabilityAdminSummaryResponseSchema,
  documentizabilityCapabilitiesResponseSchema,
  documentizabilityRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import {
  buildDocumentizabilityAdminRecords,
  buildDocumentizabilityAdminStats,
  getDocumentizabilityAdminGuidance,
  resolveDocumentizabilityAdminActions,
} from './documentizability-admin.helpers.js'
import { evaluateDocumentizabilityRollout } from './documentizability-rollout.helpers.js'
import { DocumentizabilityStatusService } from './documentizability-status.service.js'

@Injectable()
export class DocumentizabilityAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly documentizabilityStatusService: DocumentizabilityStatusService,
  ) {}

  getCapabilities() {
    return documentizabilityCapabilitiesResponseSchema.parse({
      supportsDocumentizabilityRollout: true,
      supportsDocumentizabilityAdminTools: true,
      supportsMembershipDocumentizabilitySignals: true,
      supportsUsageEventDocumentizabilitySignals: true,
      guidance: getDocumentizabilityRolloutGuidance(),
    })
  }

  async getDocumentizabilityRollout() {
    const documentizabilityTableCoverage =
      await this.documentizabilityStatusService.getDocumentizabilityTableCoverage()

    const rollout = evaluateDocumentizabilityRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.documentizabilityStatusService.pingPostgres(),
      existingDocumentizabilityTableCount: documentizabilityTableCoverage.existingDocumentizabilityTableCount,
      workspaceMembershipsTableExists: documentizabilityTableCoverage.workspaceMembershipsTableExists,
      usageEventsTableExists: documentizabilityTableCoverage.usageEventsTableExists,
      billingNotificationsTableExists: documentizabilityTableCoverage.billingNotificationsTableExists,
    })

    return documentizabilityRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceDocumentizabilityAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageDocumentizability(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventoryItems =
      await this.documentizabilityStatusService.getWorkspaceDocumentizabilityInventory(
        workspaceId,
      )
    const records = buildDocumentizabilityAdminRecords(inventoryItems)
    const postgresConnectivity = await this.documentizabilityStatusService.pingPostgres()
    const stats = buildDocumentizabilityAdminStats({
      records,
      postgresConnectivity,
    })

    return documentizabilityAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveDocumentizabilityAdminActions(),
      guidance: getDocumentizabilityAdminGuidance({ stats }),
    })
  }

  async executeDocumentizabilityAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_documentizability_summary'
    },
  ) {
    this.assertCanManageDocumentizability(authContext)

    const payload = documentizabilityAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_documentizability_summary': {
        const summary = await this.getWorkspaceDocumentizabilityAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return documentizabilityAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed documentizability summary with ${summary.stats.documentizabilityPercent}% membership documentizability across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private assertCanManageDocumentizability(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production documentizability tools.',
    })
  }
}
