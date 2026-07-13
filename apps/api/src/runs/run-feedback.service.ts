import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  createRunFeedbackRequestSchema,
  runFeedbackResponseSchema,
  type AuthContext,
  type RunFeedbackResponse,
} from '@ai-war-room/schemas'
import { randomUUID } from 'node:crypto'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import {
  RUN_REPOSITORY,
  type RunRepository,
} from '../persistence/run.repository.js'

@Injectable()
export class RunFeedbackService {
  private readonly feedbackByKey = new Map<string, RunFeedbackResponse>()

  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly postgresService: PostgresService,
    private readonly observabilityService: ObservabilityService,
    @Inject(RUN_REPOSITORY)
    private readonly runRepository: RunRepository,
  ) {}

  async createFeedback(input: {
    authContext: AuthContext
    body: unknown
  }): Promise<RunFeedbackResponse> {
    const parsed = createRunFeedbackRequestSchema.safeParse(input.body)

    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid run feedback request.',
        issues: parsed.error.issues,
      })
    }

    const request = parsed.data
    const targetKey =
      request.targetType === 'artifact' ? request.artifactId! : request.runId

    if (request.targetType === 'artifact') {
      const artifact = await this.runRepository.findArtifactById(
        input.authContext.workspaceId,
        request.artifactId!,
      )

      if (!artifact) {
        throw new NotFoundException({
          message: 'Artifact not found in this workspace.',
        })
      }

      if (artifact.runId !== request.runId) {
        throw new BadRequestException({
          message: 'artifactId does not belong to the given runId.',
        })
      }
    } else {
      const artifacts = await this.runRepository.listArtifacts(
        input.authContext.workspaceId,
      )
      const runKnown = artifacts.some(
        (artifact) => artifact.runId === request.runId,
      )

      if (!runKnown) {
        throw new NotFoundException({
          message: 'Run not found in this workspace.',
        })
      }
    }

    const now = new Date().toISOString()
    const existing = await this.findFeedback({
      workspaceId: input.authContext.workspaceId,
      actorUserId: input.authContext.userId,
      targetType: request.targetType,
      targetKey,
    })

    const feedback = runFeedbackResponseSchema.parse({
      feedbackId: existing?.feedbackId ?? `feedback_${randomUUID()}`,
      workspaceId: input.authContext.workspaceId,
      runId: request.runId,
      artifactId: request.artifactId ?? null,
      targetType: request.targetType,
      targetKey,
      actorUserId: input.authContext.userId,
      usefulness: request.usefulness,
      comment: request.comment?.trim() ? request.comment.trim() : null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    })

    await this.persistFeedback(feedback)

    this.observabilityService.record('run_feedback_recorded', {
      workspaceId: feedback.workspaceId,
      runId: feedback.runId,
      targetType: feedback.targetType,
      usefulness: feedback.usefulness,
    })

    return feedback
  }

  async listForRun(input: {
    workspaceId: string
    runId: string
  }): Promise<RunFeedbackResponse[]> {
    const memoryMatches = [...this.feedbackByKey.values()].filter(
      (item) =>
        item.workspaceId === input.workspaceId && item.runId === input.runId,
    )

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return memoryMatches.sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      )
    }

    const result = await this.postgresService.query<{
      feedback_id: string
      workspace_id: string
      run_id: string
      artifact_id: string | null
      target_type: RunFeedbackResponse['targetType']
      target_key: string
      actor_user_id: string
      usefulness: RunFeedbackResponse['usefulness']
      comment: string | null
      created_at: Date
      updated_at: Date
    }>(
      `SELECT feedback_id, workspace_id, run_id, artifact_id, target_type, target_key,
              actor_user_id, usefulness, comment, created_at, updated_at
       FROM run_feedback
       WHERE workspace_id = $1 AND run_id = $2
       ORDER BY updated_at DESC`,
      [input.workspaceId, input.runId],
    )

    return result.rows.map((row) => this.mapRow(row))
  }

  private memoryKey(input: {
    workspaceId: string
    actorUserId: string
    targetType: string
    targetKey: string
  }) {
    return `${input.workspaceId}:${input.actorUserId}:${input.targetType}:${input.targetKey}`
  }

  private async findFeedback(input: {
    workspaceId: string
    actorUserId: string
    targetType: RunFeedbackResponse['targetType']
    targetKey: string
  }): Promise<RunFeedbackResponse | null> {
    const cached = this.feedbackByKey.get(this.memoryKey(input))

    if (cached) {
      return cached
    }

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return null
    }

    const result = await this.postgresService.query<{
      feedback_id: string
      workspace_id: string
      run_id: string
      artifact_id: string | null
      target_type: RunFeedbackResponse['targetType']
      target_key: string
      actor_user_id: string
      usefulness: RunFeedbackResponse['usefulness']
      comment: string | null
      created_at: Date
      updated_at: Date
    }>(
      `SELECT feedback_id, workspace_id, run_id, artifact_id, target_type, target_key,
              actor_user_id, usefulness, comment, created_at, updated_at
       FROM run_feedback
       WHERE workspace_id = $1
         AND actor_user_id = $2
         AND target_type = $3
         AND target_key = $4
       LIMIT 1`,
      [
        input.workspaceId,
        input.actorUserId,
        input.targetType,
        input.targetKey,
      ],
    )

    const row = result.rows[0]
    return row ? this.mapRow(row) : null
  }

  private async persistFeedback(feedback: RunFeedbackResponse) {
    this.feedbackByKey.set(
      this.memoryKey({
        workspaceId: feedback.workspaceId,
        actorUserId: feedback.actorUserId,
        targetType: feedback.targetType,
        targetKey: feedback.targetKey,
      }),
      feedback,
    )

    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return
    }

    await this.postgresService.query(
      `INSERT INTO run_feedback (
         feedback_id, workspace_id, run_id, artifact_id, target_type, target_key,
         actor_user_id, usefulness, comment, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::timestamptz, $11::timestamptz)
       ON CONFLICT (workspace_id, actor_user_id, target_type, target_key)
       DO UPDATE SET
         usefulness = EXCLUDED.usefulness,
         comment = EXCLUDED.comment,
         artifact_id = EXCLUDED.artifact_id,
         run_id = EXCLUDED.run_id,
         updated_at = EXCLUDED.updated_at`,
      [
        feedback.feedbackId,
        feedback.workspaceId,
        feedback.runId,
        feedback.artifactId,
        feedback.targetType,
        feedback.targetKey,
        feedback.actorUserId,
        feedback.usefulness,
        feedback.comment,
        feedback.createdAt,
        feedback.updatedAt,
      ],
    )
  }

  private mapRow(row: {
    feedback_id: string
    workspace_id: string
    run_id: string
    artifact_id: string | null
    target_type: RunFeedbackResponse['targetType']
    target_key: string
    actor_user_id: string
    usefulness: RunFeedbackResponse['usefulness']
    comment: string | null
    created_at: Date
    updated_at: Date
  }): RunFeedbackResponse {
    return runFeedbackResponseSchema.parse({
      feedbackId: row.feedback_id,
      workspaceId: row.workspace_id,
      runId: row.run_id,
      artifactId: row.artifact_id,
      targetType: row.target_type,
      targetKey: row.target_key,
      actorUserId: row.actor_user_id,
      usefulness: row.usefulness,
      comment: row.comment,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    })
  }
}
