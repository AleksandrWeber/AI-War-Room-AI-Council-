import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  createShieldFalsePositiveReportRequestSchema,
  shieldFalsePositiveReportListResponseSchema,
  shieldFalsePositiveReportResponseSchema,
  type AuthContext,
  type ShieldFalsePositiveReportListResponse,
  type ShieldFalsePositiveReportResponse,
} from '@ai-war-room/schemas'
import { randomUUID } from 'node:crypto'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { PostgresService } from '../persistence/postgres.service.js'

@Injectable()
export class ShieldFalsePositiveService {
  private readonly reportsByKey = new Map<string, ShieldFalsePositiveReportResponse>()

  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly postgresService: PostgresService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async createReport(input: {
    runId: string
    authContext: AuthContext
    body: unknown
  }): Promise<ShieldFalsePositiveReportResponse> {
    const parsed = createShieldFalsePositiveReportRequestSchema.safeParse(
      input.body,
    )

    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid Shield false-positive report request.',
        issues: parsed.error.issues,
      })
    }

    this.assertCanReport(input.authContext)

    const finding = parsed.data.shieldScan.findings.find(
      (item) => item.findingId === parsed.data.findingId,
    )

    if (!finding) {
      throw new BadRequestException({
        message: 'findingId must match a finding on the provided Shield scan.',
      })
    }

    if (finding.severity === 'critical') {
      throw new BadRequestException({
        message:
          'Critical findings require an owner/admin Shield override, not a false-positive report.',
      })
    }

    const cacheKey = this.buildKey(
      input.authContext.workspaceId,
      input.runId,
      parsed.data.findingId,
    )
    const existing = await this.findReport({
      workspaceId: input.authContext.workspaceId,
      runId: input.runId,
      findingId: parsed.data.findingId,
    })

    if (existing) {
      return existing
    }

    const now = new Date().toISOString()
    const report = shieldFalsePositiveReportResponseSchema.parse({
      reportId: `shield_fp_${randomUUID()}`,
      runId: input.runId,
      workspaceId: input.authContext.workspaceId,
      scanId: parsed.data.shieldScan.scanId,
      findingId: finding.findingId,
      severity: finding.severity,
      category: finding.category,
      actorUserId: input.authContext.userId,
      actorRole: input.authContext.role,
      note: parsed.data.note?.trim() ? parsed.data.note.trim() : null,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    })

    await this.persistReport(report)
    this.reportsByKey.set(cacheKey, report)

    this.observabilityService.record('shield_false_positive_reported', {
      workspaceId: report.workspaceId,
      runId: report.runId,
      actorUserId: report.actorUserId,
      actorRole: report.actorRole,
      severity: report.severity,
      category: report.category,
    })

    return report
  }

  async listWorkspaceReports(
    authContext: AuthContext,
    workspaceId: string,
  ): Promise<ShieldFalsePositiveReportListResponse> {
    if (authContext.role !== 'owner' && authContext.role !== 'admin') {
      throw new ForbiddenException({
        message: 'Only workspace owners or admins can list false-positive reports.',
      })
    }

    if (authContext.workspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const reports = await this.loadWorkspaceReports(workspaceId)
    const openCount = reports.filter((report) => report.status === 'open').length

    return shieldFalsePositiveReportListResponseSchema.parse({
      workspaceId,
      reports,
      openCount,
    })
  }

  private assertCanReport(authContext: AuthContext) {
    if (authContext.role === 'viewer') {
      throw new ForbiddenException({
        message: 'Viewers cannot report Shield false positives.',
      })
    }
  }

  private buildKey(workspaceId: string, runId: string, findingId: string) {
    return `${workspaceId}:${runId}:${findingId}`
  }

  private async findReport(input: {
    workspaceId: string
    runId: string
    findingId: string
  }): Promise<ShieldFalsePositiveReportResponse | null> {
    const cached = this.reportsByKey.get(
      this.buildKey(input.workspaceId, input.runId, input.findingId),
    )

    if (cached) {
      return cached
    }

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return null
    }

    const result = await this.postgresService.query<{
      report_id: string
      workspace_id: string
      run_id: string
      scan_id: string
      finding_id: string
      severity: string
      category: string
      actor_user_id: string
      actor_role: string
      note: string | null
      status: string
      created_at: Date
      updated_at: Date
    }>(
      `SELECT report_id, workspace_id, run_id, scan_id, finding_id, severity, category,
              actor_user_id, actor_role, note, status, created_at, updated_at
       FROM shield_false_positive_reports
       WHERE workspace_id = $1 AND run_id = $2 AND finding_id = $3
       LIMIT 1`,
      [input.workspaceId, input.runId, input.findingId],
    )

    const row = result.rows[0]
    if (!row) {
      return null
    }

    const report = this.mapRow(row)
    this.reportsByKey.set(
      this.buildKey(input.workspaceId, input.runId, input.findingId),
      report,
    )
    return report
  }

  private async loadWorkspaceReports(
    workspaceId: string,
  ): Promise<ShieldFalsePositiveReportResponse[]> {
    const memoryReports = [...this.reportsByKey.values()]
      .filter((report) => report.workspaceId === workspaceId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return memoryReports
    }

    const result = await this.postgresService.query<{
      report_id: string
      workspace_id: string
      run_id: string
      scan_id: string
      finding_id: string
      severity: string
      category: string
      actor_user_id: string
      actor_role: string
      note: string | null
      status: string
      created_at: Date
      updated_at: Date
    }>(
      `SELECT report_id, workspace_id, run_id, scan_id, finding_id, severity, category,
              actor_user_id, actor_role, note, status, created_at, updated_at
       FROM shield_false_positive_reports
       WHERE workspace_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [workspaceId],
    )

    return result.rows.map((row) => this.mapRow(row))
  }

  private mapRow(row: {
    report_id: string
    workspace_id: string
    run_id: string
    scan_id: string
    finding_id: string
    severity: string
    category: string
    actor_user_id: string
    actor_role: string
    note: string | null
    status: string
    created_at: Date
    updated_at: Date
  }): ShieldFalsePositiveReportResponse {
    return shieldFalsePositiveReportResponseSchema.parse({
      reportId: row.report_id,
      workspaceId: row.workspace_id,
      runId: row.run_id,
      scanId: row.scan_id,
      findingId: row.finding_id,
      severity: row.severity,
      category: row.category,
      actorUserId: row.actor_user_id,
      actorRole: row.actor_role,
      note: row.note,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    })
  }

  private async persistReport(report: ShieldFalsePositiveReportResponse) {
    this.reportsByKey.set(
      this.buildKey(report.workspaceId, report.runId, report.findingId),
      report,
    )

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return
    }

    await this.postgresService.query(
      `INSERT INTO shield_false_positive_reports (
         report_id, workspace_id, run_id, scan_id, finding_id, severity, category,
         actor_user_id, actor_role, note, status, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (workspace_id, run_id, finding_id) DO NOTHING`,
      [
        report.reportId,
        report.workspaceId,
        report.runId,
        report.scanId,
        report.findingId,
        report.severity,
        report.category,
        report.actorUserId,
        report.actorRole,
        report.note,
        report.status,
        report.createdAt,
        report.updatedAt,
      ],
    )
  }
}
