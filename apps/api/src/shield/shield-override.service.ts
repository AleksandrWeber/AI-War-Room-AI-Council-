import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  createShieldOverrideRequestSchema,
  shieldOverrideResponseSchema,
  type AuthContext,
  type ShieldOverrideResponse,
} from '@ai-war-room/schemas'
import { randomUUID } from 'node:crypto'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { PostgresService } from '../persistence/postgres.service.js'

@Injectable()
export class ShieldOverrideService {
  private readonly overridesByRunId = new Map<string, ShieldOverrideResponse>()

  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly postgresService: PostgresService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async createOverride(input: {
    runId: string
    authContext: AuthContext
    body: unknown
  }): Promise<ShieldOverrideResponse> {
    const parsed = createShieldOverrideRequestSchema.safeParse(input.body)

    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid Shield override request.',
        issues: parsed.error.issues,
      })
    }

    this.assertCanOverride(input.authContext)

    if (
      parsed.data.shieldScan.status !== 'blocked' &&
      parsed.data.shieldScan.maxSeverity !== 'critical'
    ) {
      throw new BadRequestException({
        message: 'Shield override is only allowed for critical/blocked scans.',
      })
    }

    const knownFindingIds = new Set(
      parsed.data.shieldScan.findings.map((finding) => finding.findingId),
    )

    if (parsed.data.findingIds.some((findingId) => !knownFindingIds.has(findingId))) {
      throw new BadRequestException({
        message: 'Override findingIds must match the Shield scan findings.',
      })
    }

    const existing = await this.findOverrideByRunId(input.runId)

    if (existing) {
      return existing
    }

    const override = shieldOverrideResponseSchema.parse({
      overrideId: `override_${randomUUID()}`,
      runId: input.runId,
      workspaceId: input.authContext.workspaceId,
      actorUserId: input.authContext.userId,
      actorRole: input.authContext.role,
      reason: parsed.data.reason,
      findingIds: parsed.data.findingIds,
      scanId: parsed.data.shieldScan.scanId,
      createdAt: new Date().toISOString(),
    })

    await this.persistOverride(override)

    this.observabilityService.record('shield_override_recorded', {
      workspaceId: override.workspaceId,
      runId: override.runId,
      actorUserId: override.actorUserId,
      actorRole: override.actorRole,
      findingCount: override.findingIds.length,
    })

    return override
  }

  async assertExecutionAllowed(input: {
    runId: string
    workspaceId: string
    shieldStatus: string
    maxSeverity: string
  }) {
    const requiresOverride =
      input.shieldStatus === 'blocked' || input.maxSeverity === 'critical'

    if (!requiresOverride) {
      return
    }

    const override = await this.findOverrideByRunId(input.runId)

    if (!override || override.workspaceId !== input.workspaceId) {
      throw new ForbiddenException({
        message:
          'This prompt is blocked due to a critical security risk. Edit the idea before using LLM features.',
      })
    }
  }

  async findOverrideByRunId(runId: string): Promise<ShieldOverrideResponse | null> {
    const cached = this.overridesByRunId.get(runId)

    if (cached) {
      return cached
    }

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return null
    }

    const result = await this.postgresService.query<{
      override_id: string
      run_id: string
      workspace_id: string
      actor_user_id: string
      actor_role: string
      reason: string
      finding_ids: string[]
      scan_id: string
      created_at: Date
    }>(
      `SELECT override_id, run_id, workspace_id, actor_user_id, actor_role, reason,
              finding_ids, scan_id, created_at
       FROM shield_overrides
       WHERE run_id = $1
       LIMIT 1`,
      [runId],
    )

    const row = result.rows[0]

    if (!row) {
      return null
    }

    const override = shieldOverrideResponseSchema.parse({
      overrideId: row.override_id,
      runId: row.run_id,
      workspaceId: row.workspace_id,
      actorUserId: row.actor_user_id,
      actorRole: row.actor_role,
      reason: row.reason,
      findingIds: row.finding_ids,
      scanId: row.scan_id,
      createdAt: row.created_at.toISOString(),
    })

    this.overridesByRunId.set(runId, override)
    return override
  }

  private assertCanOverride(authContext: AuthContext) {
    if (authContext.role !== 'owner' && authContext.role !== 'admin') {
      throw new ForbiddenException({
        message: 'Only workspace owners or admins can override critical Shield findings.',
      })
    }
  }

  private async persistOverride(override: ShieldOverrideResponse) {
    this.overridesByRunId.set(override.runId, override)

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return
    }

    await this.postgresService.query(
      `INSERT INTO shield_overrides (
         override_id, run_id, workspace_id, actor_user_id, actor_role,
         reason, finding_ids, scan_id, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
       ON CONFLICT (run_id) DO NOTHING`,
      [
        override.overrideId,
        override.runId,
        override.workspaceId,
        override.actorUserId,
        override.actorRole,
        override.reason,
        JSON.stringify(override.findingIds),
        override.scanId,
        override.createdAt,
      ],
    )
  }
}
