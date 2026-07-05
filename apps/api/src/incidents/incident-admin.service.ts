import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  getIncidentResponseRolloutGuidance,
  incidentAdminActionRequestSchema,
  incidentAdminActionResponseSchema,
  incidentAdminSummaryResponseSchema,
  incidentResponseCapabilitiesResponseSchema,
  incidentResponseRolloutResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import {
  buildIncidentAdminRecords,
  buildIncidentAdminStats,
  getIncidentAdminGuidance,
  resolveIncidentAdminActions,
} from './incident-admin.helpers.js'
import { evaluateIncidentResponseRollout } from './incident-response-rollout.helpers.js'
import { IncidentStatusService } from './incident-status.service.js'

@Injectable()
export class IncidentAdminService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly incidentStatusService: IncidentStatusService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  getCapabilities() {
    return incidentResponseCapabilitiesResponseSchema.parse({
      supportsIncidentResponseRollout: true,
      supportsIncidentAdminTools: true,
      supportsBillingAlertEscalation: true,
      supportsObservabilityIncidentBuffer: true,
      guidance: getIncidentResponseRolloutGuidance(),
    })
  }

  async getIncidentResponseRollout() {
    const incidentTableCoverage =
      await this.incidentStatusService.getIncidentTableCoverage()
    const rollout = evaluateIncidentResponseRollout({
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
      postgresConnectivity: await this.incidentStatusService.pingPostgres(),
      existingIncidentTableCount:
        incidentTableCoverage.existingIncidentTableCount,
      billingAlertEscalationConfigured: this.isBillingAlertEscalationConfigured(),
      observabilityBufferCapacity:
        this.observabilityService.getRecentEventBufferCapacity(),
    })

    return incidentResponseRolloutResponseSchema.parse({
      ...rollout,
      checkedAt: new Date().toISOString(),
    })
  }

  async getWorkspaceIncidentAdminSummary(
    authContext: AuthContext,
    workspaceId: string,
  ) {
    this.assertCanManageIncidents(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const inventory =
      await this.incidentStatusService.getWorkspaceIncidentInventory(workspaceId)
    const records = buildIncidentAdminRecords(inventory)
    const postgresConnectivity = await this.incidentStatusService.pingPostgres()
    const observabilityErrorEvents = this.countObservabilityErrorEvents(
      workspaceId,
    )
    const stats = buildIncidentAdminStats({
      records,
      postgresConnectivity,
      observabilityErrorEvents,
    })

    return incidentAdminSummaryResponseSchema.parse({
      workspaceId,
      role: authContext.role,
      records,
      stats,
      availableActions: resolveIncidentAdminActions(),
      guidance: getIncidentAdminGuidance({ stats }),
    })
  }

  async executeIncidentAdminAction(
    authContext: AuthContext,
    input: {
      workspaceId: string
      action: 'refresh_incident_summary'
    },
  ) {
    this.assertCanManageIncidents(authContext)

    const payload = incidentAdminActionRequestSchema.parse({
      workspaceId: input.workspaceId,
      action: input.action,
    })

    if (payload.workspaceId !== authContext.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    switch (payload.action) {
      case 'refresh_incident_summary': {
        const summary = await this.getWorkspaceIncidentAdminSummary(
          authContext,
          payload.workspaceId,
        )

        return incidentAdminActionResponseSchema.parse({
          workspaceId: payload.workspaceId,
          action: payload.action,
          message: `Refreshed incident summary with ${summary.stats.totalRecords} incident record(s) across ${summary.stats.coveredDomains}/${summary.stats.totalDomains} domain(s).`,
          stats: summary.stats,
        })
      }
    }
  }

  private isBillingAlertEscalationConfigured() {
    const adapter = this.configService.get('BILLING_NOTIFICATION_ADAPTER', {
      infer: true,
    })
    const recipient = this.configService.get('BILLING_NOTIFICATION_RECIPIENT', {
      infer: true,
    })

    return adapter === 'email' && Boolean(recipient)
  }

  private countObservabilityErrorEvents(workspaceId: string) {
    return this.observabilityService
      .getRecentEventsForWorkspace(workspaceId)
      .filter((event) => event.level === 'error').length
  }

  private assertCanManageIncidents(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message:
        'Only workspace owners and admins can manage production incident response tools.',
    })
  }
}
