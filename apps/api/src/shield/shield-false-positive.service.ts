import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  createShieldFalsePositiveReportRequestSchema,
  resolveShieldFalsePositiveReportRequestSchema,
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

type ReportRow = {
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
  reviewed_by_user_id: string | null
  reviewed_at: Date | null
  review_note: string | null
  created_at: Date
  updated_at: Date
}

@Injectable()
export class ShieldFalsePositiveService {
  private readonly reportsByKey = new Map<string, ShieldFalsePositiveReportResponse>()
  private readonly reportsById = new Map<string, ShieldFalsePositiveReportResponse>()

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
      reviewedByUserId: null,
      reviewedAt: null,
      reviewNote: null,
      createdAt: now,
      updatedAt: now,
    })

    await this.persistReport(report)

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

  async resolveReport(input: {
    authContext: AuthContext
    workspaceId: string
    reportId: string
    body: unknown
  }): Promise<ShieldFalsePositiveReportResponse> {
    if (input.authContext.role !== 'owner' && input.authContext.role !== 'admin') {
      throw new ForbiddenException({
        message: 'Only workspace owners or admins can triage false-positive reports.',
      })
    }

    if (input.authContext.workspaceId !== input.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const parsed = resolveShieldFalsePositiveReportRequestSchema.safeParse(
      input.body,
    )

    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid Shield false-positive resolve request.',
        issues: parsed.error.issues,
      })
    }

    const existing = await this.findReportById(
      input.workspaceId,
      input.reportId,
    )

    if (!existing) {
      throw new NotFoundException({
        message: 'False-positive report was not found.',
      })
    }

    if (existing.status !== 'open') {
      return existing
    }

    const now = new Date().toISOString()
    const report = shieldFalsePositiveReportResponseSchema.parse({
      ...existing,
      status: parsed.data.decision,
      reviewedByUserId: input.authContext.userId,
      reviewedAt: now,
      reviewNote: parsed.data.note?.trim() ? parsed.data.note.trim() : null,
      updatedAt: now,
    })

    await this.persistResolvedReport(report)

    this.observabilityService.record('shield_false_positive_resolved', {
      workspaceId: report.workspaceId,
      runId: report.runId,
      reportId: report.reportId,
      decision: report.status,
      actorUserId: input.authContext.userId,
      actorRole: input.authContext.role,
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

  private cacheReport(report: ShieldFalsePositiveReportResponse) {
    this.reportsByKey.set(
      this.buildKey(report.workspaceId, report.runId, report.findingId),
      report,
    )
    this.reportsById.set(report.reportId, report)
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

    const result = await this.postgresService.query<ReportRow>(
      `SELECT report_id, workspace_id, run_id, scan_id, finding_id, severity, category,
              actor_user_id, actor_role, note, status, reviewed_by_user_id, reviewed_at,
              review_note, created_at, updated_at
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
    this.cacheReport(report)
    return report
  }

  private async findReportById(
    workspaceId: string,
    reportId: string,
  ): Promise<ShieldFalsePositiveReportResponse | null> {
    const cached = this.reportsById.get(reportId)
    if (cached && cached.workspaceId === workspaceId) {
      return cached
    }

    for (const report of this.reportsByKey.values()) {
      if (report.reportId === reportId && report.workspaceId === workspaceId) {
        this.reportsById.set(reportId, report)
        return report
      }
    }

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return null
    }

    const result = await this.postgresService.query<ReportRow>(
      `SELECT report_id, workspace_id, run_id, scan_id, finding_id, severity, category,
              actor_user_id, actor_role, note, status, reviewed_by_user_id, reviewed_at,
              review_note, created_at, updated_at
       FROM shield_false_positive_reports
       WHERE workspace_id = $1 AND report_id = $2
       LIMIT 1`,
      [workspaceId, reportId],
    )

    const row = result.rows[0]
    if (!row) {
      return null
    }

    const report = this.mapRow(row)
    this.cacheReport(report)
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

    const result = await this.postgresService.query<ReportRow>(
      `SELECT report_id, workspace_id, run_id, scan_id, finding_id, severity, category,
              actor_user_id, actor_role, note, status, reviewed_by_user_id, reviewed_at,
              review_note, created_at, updated_at
       FROM shield_false_positive_reports
       WHERE workspace_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [workspaceId],
    )

    return result.rows.map((row) => this.mapRow(row))
  }

  private mapRow(row: ReportRow): ShieldFalsePositiveReportResponse {
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
      reviewedByUserId: row.reviewed_by_user_id,
      reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
      reviewNote: row.review_note,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    })
  }

  private async persistReport(report: ShieldFalsePositiveReportResponse) {
    this.cacheReport(report)

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return
    }

    await this.postgresService.query(
      `INSERT INTO shield_false_positive_reports (
         report_id, workspace_id, run_id, scan_id, finding_id, severity, category,
         actor_user_id, actor_role, note, status, reviewed_by_user_id, reviewed_at,
         review_note, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
        report.reviewedByUserId,
        report.reviewedAt,
        report.reviewNote,
        report.createdAt,
        report.updatedAt,
      ],
    )
  }

  private async persistResolvedReport(report: ShieldFalsePositiveReportResponse) {
    this.cacheReport(report)

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return
    }

    await this.postgresService.query(
      `UPDATE shield_false_positive_reports
       SET status = $2,
           reviewed_by_user_id = $3,
           reviewed_at = $4,
           review_note = $5,
           updated_at = $6
       WHERE report_id = $1
         AND workspace_id = $7
         AND status = 'open'`,
      [
        report.reportId,
        report.status,
        report.reviewedByUserId,
        report.reviewedAt,
        report.reviewNote,
        report.updatedAt,
        report.workspaceId,
      ],
    )
  }
}
