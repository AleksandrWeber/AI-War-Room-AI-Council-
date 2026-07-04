import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import {
  workspaceAuditExportFormatSchema,
  workspaceAuditExportResponseSchema,
  type AuthContext,
} from '@ai-war-room/schemas'
import { BillingService } from '../billing/billing.service.js'
import { USAGE_REPOSITORY, type UsageRepository } from '../usage/usage.repository.js'
import {
  buildWorkspaceAuditExportFilename,
  buildWorkspaceAuditExportStats,
  serializeWorkspaceAuditCsv,
} from './workspace-audit-export.helpers.js'

@Injectable()
export class WorkspaceAuditService {
  constructor(
    @Inject(USAGE_REPOSITORY)
    private readonly usageRepository: UsageRepository,
    private readonly billingService: BillingService,
  ) {}

  async exportWorkspaceAudit(
    authContext: AuthContext,
    workspaceId: string,
    formatInput: string | undefined,
  ) {
    this.assertCanExportWorkspaceAudit(authContext)

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const parsedFormat = workspaceAuditExportFormatSchema.safeParse(
      formatInput ?? 'csv',
    )

    if (!parsedFormat.success) {
      throw new BadRequestException({
        message: 'Unsupported workspace audit export format. Use csv or json.',
      })
    }

    const format = parsedFormat.data
    const [
      usageEvents,
      billingWebhookEventsResponse,
      billingNotificationsResponse,
      meterUsageReportsResponse,
    ] = await Promise.all([
      this.usageRepository.listWorkspaceUsageEvents(workspaceId),
      this.billingService.listWorkspaceWebhookEvents(workspaceId),
      this.billingService.listWorkspaceNotifications(workspaceId),
      this.billingService.listWorkspaceMeterUsageReports(workspaceId),
    ])
    const billingWebhookEvents = billingWebhookEventsResponse.events
    const billingNotifications = billingNotificationsResponse.notifications
    const meterUsageReports = meterUsageReportsResponse.reports
    const exportedAt = new Date().toISOString()
    const audit = workspaceAuditExportResponseSchema.parse({
      workspaceId,
      exportedAt,
      stats: buildWorkspaceAuditExportStats({
        workspaceId,
        exportedAt,
        stats: {
          usageEventCount: usageEvents.length,
          billingWebhookEventCount: billingWebhookEvents.length,
          billingNotificationCount: billingNotifications.length,
          meterUsageReportCount: meterUsageReports.length,
        },
        usageEvents,
        billingWebhookEvents,
        billingNotifications,
        meterUsageReports,
      }),
      usageEvents,
      billingWebhookEvents,
      billingNotifications,
      meterUsageReports,
    })
    const filename = buildWorkspaceAuditExportFilename(workspaceId, format)

    if (format === 'json') {
      return {
        contentType: 'application/json; charset=utf-8',
        filename,
        body: JSON.stringify(audit, null, 2),
      }
    }

    return {
      contentType: 'text/csv; charset=utf-8',
      filename,
      body: serializeWorkspaceAuditCsv(audit),
    }
  }

  private assertCanExportWorkspaceAudit(authContext: AuthContext) {
    if (authContext.role === 'owner' || authContext.role === 'admin') {
      return
    }

    throw new ForbiddenException({
      message: 'Only workspace owners and admins can export workspace audit data.',
    })
  }
}
