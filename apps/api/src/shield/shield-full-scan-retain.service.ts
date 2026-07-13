import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  shieldFullScanDisputeResponseSchema,
  shieldFullScanPurgeResponseSchema,
  shieldFullScanRetainRecordSchema,
  type AuthContext,
  type DraftRun,
  type ShieldFinding,
  type ShieldFullScanDisputeResponse,
  type ShieldFullScanPurgeResponse,
  type ShieldFullScanRetainRecord,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import {
  USAGE_REPOSITORY,
  type UsageRepository,
} from '../usage/usage.repository.js'
import { redactShieldFindingsForPersistence } from './shield-persistence-redaction.js'

const SENSITIVE_CATEGORIES = new Set(['secrets', 'pii'])

@Injectable()
export class ShieldFullScanRetainService {
  private readonly recordsByScanId = new Map<string, ShieldFullScanRetainRecord>()

  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly postgresService: PostgresService,
    private readonly observabilityService: ObservabilityService,
    @Inject(USAGE_REPOSITORY)
    private readonly usageRepository: UsageRepository,
  ) {}

  isFeatureEnabled() {
    return this.configService.get('SHIELD_FULL_SCAN_RETAIN_ENABLED', {
      infer: true,
    })
  }

  retainHours() {
    return this.configService.get('SHIELD_FULL_SCAN_RETAIN_HOURS', {
      infer: true,
    })
  }

  async maybeRetainFullScan(draftRun: DraftRun): Promise<void> {
    if (!this.isFeatureEnabled()) {
      return
    }

    if (!this.hasSensitiveFindings(draftRun.shieldScan.findings)) {
      return
    }

    const limit = await this.usageRepository.getWorkspaceLimit(
      draftRun.workspaceId,
    )

    if (limit?.paidTier !== 'business') {
      return
    }

    const createdAt = new Date(draftRun.createdAt)
    const retainUntil = new Date(
      createdAt.getTime() + this.retainHours() * 60 * 60 * 1000,
    ).toISOString()

    const record = shieldFullScanRetainRecordSchema.parse({
      scanId: draftRun.shieldScan.scanId,
      workspaceId: draftRun.workspaceId,
      runId: draftRun.runId,
      findings: draftRun.shieldScan.findings,
      retainUntil,
      redactedAt: null,
      createdAt: draftRun.createdAt,
    })

    await this.persistRecord(record)

    this.observabilityService.record('shield_full_scan_retained', {
      workspaceId: record.workspaceId,
      runId: record.runId,
      scanId: record.scanId,
      retainHours: this.retainHours(),
      findingCount: record.findings.length,
    })
  }

  async getFullScanForDispute(input: {
    authContext: AuthContext
    workspaceId: string
    scanId: string
  }): Promise<ShieldFullScanDisputeResponse> {
    this.assertOwnerOrAdmin(input.authContext)

    if (input.authContext.workspaceId !== input.workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace header does not match request workspace.',
      })
    }

    const record = await this.findRecord(input.scanId)

    if (!record || record.workspaceId !== input.workspaceId) {
      throw new NotFoundException({
        message: 'Full Shield scan retain record was not found.',
      })
    }

    const expired =
      Boolean(record.redactedAt) ||
      new Date(record.retainUntil).getTime() <= Date.now()

    if (expired) {
      throw new NotFoundException({
        message:
          'Full Shield scan retain window has expired. Durable findings remain redacted.',
      })
    }

    this.observabilityService.record('shield_full_scan_dispute_read', {
      workspaceId: record.workspaceId,
      runId: record.runId,
      scanId: record.scanId,
      actorUserId: input.authContext.userId,
      actorRole: input.authContext.role,
    })

    return shieldFullScanDisputeResponseSchema.parse({
      scanId: record.scanId,
      workspaceId: record.workspaceId,
      runId: record.runId,
      retainUntil: record.retainUntil,
      expired: false,
      findings: record.findings,
      guidance:
        'Unredacted secrets/PII quotes are available only during the enterprise retain window for dispute/debug. Do not export raw quotes.',
    })
  }

  async purgeExpired(workspaceId: string): Promise<ShieldFullScanPurgeResponse> {
    const purgedCount = await this.redactExpiredRecords(workspaceId)

    return shieldFullScanPurgeResponseSchema.parse({
      workspaceId,
      purgedCount,
      message:
        purgedCount === 0
          ? 'No expired full-scan retain records to redact.'
          : `Redacted ${purgedCount} expired full-scan retain record(s).`,
    })
  }

  private hasSensitiveFindings(findings: ShieldFinding[]) {
    return findings.some((finding) => SENSITIVE_CATEGORIES.has(finding.category))
  }

  private assertOwnerOrAdmin(authContext: AuthContext) {
    if (authContext.role !== 'owner' && authContext.role !== 'admin') {
      throw new ForbiddenException({
        message:
          'Only workspace owners or admins can access retained full Shield scans.',
      })
    }
  }

  private async findRecord(
    scanId: string,
  ): Promise<ShieldFullScanRetainRecord | null> {
    const cached = this.recordsByScanId.get(scanId)
    if (cached) {
      return cached
    }

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return null
    }

    const result = await this.postgresService.query<{
      scan_id: string
      workspace_id: string
      run_id: string
      findings: ShieldFinding[]
      retain_until: Date
      redacted_at: Date | null
      created_at: Date
    }>(
      `SELECT scan_id, workspace_id, run_id, findings, retain_until, redacted_at, created_at
       FROM shield_scan_full_findings
       WHERE scan_id = $1
       LIMIT 1`,
      [scanId],
    )

    const row = result.rows[0]
    if (!row) {
      return null
    }

    const record = this.mapRow(row)
    this.recordsByScanId.set(scanId, record)
    return record
  }

  private async persistRecord(record: ShieldFullScanRetainRecord) {
    this.recordsByScanId.set(record.scanId, record)

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return
    }

    await this.postgresService.query(
      `INSERT INTO shield_scan_full_findings (
         scan_id, workspace_id, run_id, findings, retain_until, redacted_at, created_at
       ) VALUES ($1, $2, $3, $4::jsonb, $5, NULL, $6)
       ON CONFLICT (scan_id) DO NOTHING`,
      [
        record.scanId,
        record.workspaceId,
        record.runId,
        JSON.stringify(record.findings),
        record.retainUntil,
        record.createdAt,
      ],
    )
  }

  private async redactExpiredRecords(workspaceId: string): Promise<number> {
    const now = new Date().toISOString()

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      let purged = 0
      for (const [scanId, record] of this.recordsByScanId) {
        if (record.workspaceId !== workspaceId || record.redactedAt) {
          continue
        }

        if (new Date(record.retainUntil).getTime() > Date.now()) {
          continue
        }

        this.recordsByScanId.set(scanId, {
          ...record,
          findings: redactShieldFindingsForPersistence(record.findings),
          redactedAt: now,
        })
        purged += 1
      }
      return purged
    }

    const result = await this.postgresService.query<{
      scan_id: string
      findings: ShieldFinding[]
    }>(
      `SELECT scan_id, findings
       FROM shield_scan_full_findings
       WHERE workspace_id = $1
         AND redacted_at IS NULL
         AND retain_until <= NOW()`,
      [workspaceId],
    )

    let purged = 0
    for (const row of result.rows) {
      const redacted = redactShieldFindingsForPersistence(row.findings)
      await this.postgresService.query(
        `UPDATE shield_scan_full_findings
         SET findings = $2::jsonb,
             redacted_at = NOW()
         WHERE scan_id = $1
           AND redacted_at IS NULL`,
        [row.scan_id, JSON.stringify(redacted)],
      )
      this.recordsByScanId.delete(row.scan_id)
      purged += 1
    }

    return purged
  }

  private mapRow(row: {
    scan_id: string
    workspace_id: string
    run_id: string
    findings: ShieldFinding[]
    retain_until: Date
    redacted_at: Date | null
    created_at: Date
  }): ShieldFullScanRetainRecord {
    return shieldFullScanRetainRecordSchema.parse({
      scanId: row.scan_id,
      workspaceId: row.workspace_id,
      runId: row.run_id,
      findings: row.findings,
      retainUntil: row.retain_until.toISOString(),
      redactedAt: row.redacted_at ? row.redacted_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
    })
  }
}
