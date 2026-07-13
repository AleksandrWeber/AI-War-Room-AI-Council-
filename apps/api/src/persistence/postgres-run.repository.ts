import type {
  ArtifactHistoryItem,
  DraftRun,
  MockPipelineResult,
} from '@ai-war-room/schemas'
import {
  agentExecutionResultSchema,
  artifactHistoryItemSchema,
  draftRunSchema,
  mockPipelineResultSchema,
  moderatorSynthesisSchema,
} from '@ai-war-room/schemas'
import { Injectable } from '@nestjs/common'
import type {
  RunRepository,
  SaveDraftRunInput,
} from './run.repository.js'
import { PostgresService } from './postgres.service.js'
import { redactShieldFindingsForPersistence } from '../shield/shield-persistence-redaction.js'

type DraftRunRow = {
  run_id: string
  workspace_id: string
  status: 'draft'
  idea: unknown
  triage: unknown
  selected_agents: unknown
  estimated_duration_seconds: number
  estimated_max_cost_usd: string
  created_at: Date
  updated_at: Date
  shield_scan: {
    scan_id: string
    status: string
    max_severity: string
    findings: unknown
  }
}

type ArtifactHistoryRow = {
  artifact_id: string
  run_id: string
  workspace_id: string
  artifact_type: ArtifactHistoryItem['artifactType']
  metadata: unknown
  content: unknown
  created_at: Date
}

@Injectable()
export class PostgresRunRepository implements RunRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findDraftRunByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<DraftRun | null> {
    const result = await this.postgresService.query<DraftRunRow>(
      `
        SELECT
          r.run_id,
          r.workspace_id,
          r.status,
          r.idea,
          r.triage,
          r.selected_agents,
          r.estimated_duration_seconds,
          r.estimated_max_cost_usd,
          r.created_at,
          r.updated_at,
          json_build_object(
            'scanId', s.scan_id,
            'status', s.status,
            'maxSeverity', s.max_severity,
            'findings', s.findings
          ) AS shield_scan
        FROM idempotency_keys i
        JOIN runs r ON r.run_id = i.run_id
        JOIN shield_scans s ON s.run_id = r.run_id
        WHERE i.workspace_id = $1
          AND i.idempotency_key = $2
          AND i.expires_at > NOW()
        LIMIT 1
      `,
      [workspaceId, idempotencyKey],
    )

    const row = result.rows[0]

    if (!row) {
      return null
    }

    return draftRunSchema.parse({
      runId: row.run_id,
      workspaceId: row.workspace_id,
      status: row.status,
      idea: row.idea,
      shieldScan: row.shield_scan,
      triage: row.triage,
      selectedAgents: row.selected_agents,
      estimatedDurationSeconds: row.estimated_duration_seconds,
      estimatedMaxCostUsd: Number(row.estimated_max_cost_usd),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    })
  }

  async saveDraftRun(input: SaveDraftRunInput): Promise<void> {
    await this.postgresService.transaction(async (client) => {
      await client.query(
        `
          INSERT INTO runs (
            run_id,
            workspace_id,
            status,
            idea,
            triage,
            selected_agents,
            estimated_duration_seconds,
            estimated_max_cost_usd,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (run_id) DO NOTHING
        `,
        [
          input.draftRun.runId,
          input.draftRun.workspaceId,
          input.draftRun.status,
          JSON.stringify(input.draftRun.idea),
          JSON.stringify(input.draftRun.triage),
          JSON.stringify(input.draftRun.selectedAgents),
          input.draftRun.estimatedDurationSeconds,
          input.draftRun.estimatedMaxCostUsd,
          input.draftRun.createdAt,
          input.draftRun.updatedAt,
        ],
      )

      await client.query(
        `
          INSERT INTO shield_scans (
            scan_id,
            run_id,
            source,
            status,
            max_severity,
            findings,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (scan_id) DO NOTHING
        `,
        [
          input.draftRun.shieldScan.scanId,
          input.draftRun.runId,
          'user_input',
          input.draftRun.shieldScan.status,
          input.draftRun.shieldScan.maxSeverity,
          JSON.stringify(
            redactShieldFindingsForPersistence(
              input.draftRun.shieldScan.findings,
            ),
          ),
          input.draftRun.createdAt,
        ],
      )

      await client.query(
        `
          INSERT INTO idempotency_keys (
            workspace_id,
            idempotency_key,
            run_id,
            expires_at
          )
          VALUES ($1, $2, $3, NOW() + ($4::TEXT || ' seconds')::INTERVAL)
          ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
        `,
        [
          input.draftRun.workspaceId,
          input.idempotencyKey,
          input.draftRun.runId,
          input.idempotencyTtlSeconds,
        ],
      )
    })
  }

  async saveMockPipelineResult(result: MockPipelineResult): Promise<void> {
    await this.postgresService.transaction(async (client) => {
      await client.query(
        `
          UPDATE runs
          SET status = $2,
              completed_at = $3,
              updated_at = $3
          WHERE run_id = $1
        `,
        [result.runId, result.status, result.completedAt],
      )

      for (const agentOutput of result.agentOutputs) {
        await client.query(
          `
            INSERT INTO agent_outputs (
              run_id,
              agent_role,
              output,
              validation_status,
              prompt_version,
              model_provider,
              model_name,
              input_tokens,
              output_tokens,
              estimated_cost_usd,
              shield_scan,
              completed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `,
          [
            agentOutput.runId,
            agentOutput.agentRole,
            JSON.stringify(agentOutput.output),
            agentOutput.validationStatus,
            agentOutput.promptVersion,
            agentOutput.modelProvider,
            agentOutput.modelName,
            agentOutput.inputTokens,
            agentOutput.outputTokens,
            agentOutput.estimatedCostUsd,
            JSON.stringify(agentOutput.shieldScan ?? null),
            agentOutput.completedAt,
          ],
        )
      }

      await client.query(
        `
          INSERT INTO moderator_syntheses (run_id, synthesis, created_at)
          VALUES ($1, $2, $3)
          ON CONFLICT (run_id)
          DO UPDATE SET synthesis = EXCLUDED.synthesis,
                        created_at = EXCLUDED.created_at
        `,
        [
          result.runId,
          JSON.stringify(result.moderatorSynthesis),
          result.completedAt,
        ],
      )

      for (const artifact of result.artifacts) {
        await client.query(
          `
            INSERT INTO artifacts (
              artifact_id,
              run_id,
              workspace_id,
              artifact_type,
              metadata,
              content,
              created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (artifact_id) DO NOTHING
          `,
          [
            artifact.metadata.artifactId,
            artifact.metadata.runId,
            artifact.metadata.workspaceId,
            artifact.metadata.artifactType,
            JSON.stringify(artifact.metadata),
            JSON.stringify(artifact.artifact.content),
            artifact.metadata.createdAt,
          ],
        )
      }
    })
  }

  async findCompletedPipelineResult(
    workspaceId: string,
    runId: string,
  ): Promise<MockPipelineResult | null> {
    const runResult = await this.postgresService.query<{
      run_id: string
      workspace_id: string
      status: string
      completed_at: Date | null
    }>(
      `
        SELECT run_id, workspace_id, status, completed_at
        FROM runs
        WHERE run_id = $1
          AND workspace_id = $2
        LIMIT 1
      `,
      [runId, workspaceId],
    )
    const run = runResult.rows[0]

    if (!run || run.status !== 'completed' || !run.completed_at) {
      return null
    }

    const agentResult = await this.postgresService.query<{
      run_id: string
      agent_role: string
      output: unknown
      validation_status: string
      prompt_version: string
      model_provider: string
      model_name: string
      input_tokens: number
      output_tokens: number
      estimated_cost_usd: string
      shield_scan: unknown
      completed_at: Date
    }>(
      `
        SELECT
          run_id,
          agent_role,
          output,
          validation_status,
          prompt_version,
          model_provider,
          model_name,
          input_tokens,
          output_tokens,
          estimated_cost_usd,
          shield_scan,
          completed_at
        FROM agent_outputs
        WHERE run_id = $1
        ORDER BY completed_at ASC, agent_role ASC
      `,
      [runId],
    )

    const moderatorResult = await this.postgresService.query<{
      synthesis: unknown
    }>(
      `
        SELECT synthesis
        FROM moderator_syntheses
        WHERE run_id = $1
        LIMIT 1
      `,
      [runId],
    )
    const moderatorRow = moderatorResult.rows[0]

    if (!moderatorRow || agentResult.rows.length === 0) {
      return null
    }

    const artifactResult = await this.postgresService.query<ArtifactHistoryRow>(
      `
        SELECT
          artifact_id,
          run_id,
          workspace_id,
          artifact_type,
          metadata,
          content,
          created_at
        FROM artifacts
        WHERE run_id = $1
          AND workspace_id = $2
        ORDER BY created_at ASC, artifact_type ASC
      `,
      [runId, workspaceId],
    )

    if (artifactResult.rows.length !== 3) {
      return null
    }

    const completedAt = run.completed_at.toISOString()
    const agentOutputs = agentResult.rows.map((row) =>
      agentExecutionResultSchema.parse({
        runId: row.run_id,
        agentRole: row.agent_role,
        output: row.output,
        validationStatus: row.validation_status,
        promptVersion: row.prompt_version,
        modelProvider: row.model_provider,
        modelName: row.model_name,
        inputTokens: row.input_tokens,
        outputTokens: row.output_tokens,
        estimatedCostUsd: Number(row.estimated_cost_usd),
        shieldScan: row.shield_scan ?? undefined,
        completedAt: row.completed_at.toISOString(),
      }),
    )

    return mockPipelineResultSchema.parse({
      runId: run.run_id,
      workspaceId: run.workspace_id,
      status: 'completed',
      steps: [
        {
          stepId: 'shield_scan',
          label: 'Shield scan',
          status: 'completed',
          completedAt,
        },
        {
          stepId: 'triage',
          label: 'Triage',
          status: 'completed',
          completedAt,
        },
        {
          stepId: 'agent_pool',
          label: 'Prompt-driven agent pool',
          status: 'completed',
          completedAt,
        },
        {
          stepId: 'moderator',
          label: 'Prompt-driven Moderator synthesis',
          status: 'completed',
          completedAt,
        },
        {
          stepId: 'artifacts',
          label: 'Prompt-driven artifact generation',
          status: 'completed',
          completedAt,
        },
      ],
      agentOutputs,
      moderatorSynthesis: moderatorSynthesisSchema.parse(moderatorRow.synthesis),
      artifacts: artifactResult.rows.map((row) => {
        const history = this.parseArtifactHistoryRow(row)
        return {
          metadata: history.metadata,
          artifact: history.artifact,
        }
      }),
      completedAt,
    })
  }

  async replaceCompletedPipelineResult(result: MockPipelineResult): Promise<void> {
    await this.postgresService.transaction(async (client) => {
      await client.query(
        `
          UPDATE runs
          SET status = $2,
              completed_at = $3,
              updated_at = $3
          WHERE run_id = $1
            AND workspace_id = $4
        `,
        [result.runId, result.status, result.completedAt, result.workspaceId],
      )

      await client.query(`DELETE FROM agent_outputs WHERE run_id = $1`, [
        result.runId,
      ])

      for (const agentOutput of result.agentOutputs) {
        await client.query(
          `
            INSERT INTO agent_outputs (
              run_id,
              agent_role,
              output,
              validation_status,
              prompt_version,
              model_provider,
              model_name,
              input_tokens,
              output_tokens,
              estimated_cost_usd,
              shield_scan,
              completed_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `,
          [
            agentOutput.runId,
            agentOutput.agentRole,
            JSON.stringify(agentOutput.output),
            agentOutput.validationStatus,
            agentOutput.promptVersion,
            agentOutput.modelProvider,
            agentOutput.modelName,
            agentOutput.inputTokens,
            agentOutput.outputTokens,
            agentOutput.estimatedCostUsd,
            JSON.stringify(agentOutput.shieldScan ?? null),
            agentOutput.completedAt,
          ],
        )
      }

      await client.query(
        `
          INSERT INTO moderator_syntheses (run_id, synthesis, created_at)
          VALUES ($1, $2, $3)
          ON CONFLICT (run_id)
          DO UPDATE SET synthesis = EXCLUDED.synthesis,
                        created_at = EXCLUDED.created_at
        `,
        [
          result.runId,
          JSON.stringify(result.moderatorSynthesis),
          result.completedAt,
        ],
      )

      await client.query(`DELETE FROM artifacts WHERE run_id = $1`, [result.runId])

      for (const artifact of result.artifacts) {
        await client.query(
          `
            INSERT INTO artifacts (
              artifact_id,
              run_id,
              workspace_id,
              artifact_type,
              metadata,
              content,
              created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            artifact.metadata.artifactId,
            artifact.metadata.runId,
            artifact.metadata.workspaceId,
            artifact.metadata.artifactType,
            JSON.stringify(artifact.metadata),
            JSON.stringify(artifact.artifact.content),
            artifact.metadata.createdAt,
          ],
        )
      }
    })
  }

  async listArtifacts(workspaceId: string): Promise<ArtifactHistoryItem[]> {
    const result = await this.postgresService.query<ArtifactHistoryRow>(
      `
        SELECT
          artifact_id,
          run_id,
          workspace_id,
          artifact_type,
          metadata,
          content,
          created_at
        FROM artifacts
        WHERE workspace_id = $1
        ORDER BY created_at DESC, artifact_type ASC
      `,
      [workspaceId],
    )

    return result.rows.map((row) => this.parseArtifactHistoryRow(row))
  }

  async listIdempotencyRecords(workspaceId: string) {
    const result = await this.postgresService.query<{
      idempotency_key: string
      run_id: string
      expires_at: Date
    }>(
      `
        SELECT idempotency_key, run_id, expires_at
        FROM idempotency_keys
        WHERE workspace_id = $1
        ORDER BY expires_at DESC
        LIMIT 20
      `,
      [workspaceId],
    )

    const now = Date.now()

    return result.rows.map((row) => ({
      idempotencyKey: row.idempotency_key,
      runId: row.run_id,
      expiresAt: row.expires_at.toISOString(),
      expired: row.expires_at.getTime() <= now,
    }))
  }

  async purgeExpiredIdempotencyKeys(workspaceId: string): Promise<number> {
    const result = await this.postgresService.query(
      `
        DELETE FROM idempotency_keys
        WHERE workspace_id = $1
          AND expires_at < NOW()
      `,
      [workspaceId],
    )

    return result.rowCount ?? 0
  }

  async findArtifactById(
    workspaceId: string,
    artifactId: string,
  ): Promise<ArtifactHistoryItem | null> {
    const result = await this.postgresService.query<ArtifactHistoryRow>(
      `
        SELECT
          artifact_id,
          run_id,
          workspace_id,
          artifact_type,
          metadata,
          content,
          created_at
        FROM artifacts
        WHERE workspace_id = $1
          AND artifact_id = $2
        LIMIT 1
      `,
      [workspaceId, artifactId],
    )
    const row = result.rows[0]

    return row ? this.parseArtifactHistoryRow(row) : null
  }

  private parseArtifactHistoryRow(row: ArtifactHistoryRow): ArtifactHistoryItem {
    const metadata = row.metadata as ArtifactHistoryItem['metadata']

    return artifactHistoryItemSchema.parse({
      artifactId: row.artifact_id,
      runId: row.run_id,
      workspaceId: row.workspace_id,
      artifactType: row.artifact_type,
      artifactVersion: metadata.artifactVersion,
      createdAt: row.created_at.toISOString(),
      metadata,
      artifact: {
        artifactType: row.artifact_type,
        content: row.content,
      },
    })
  }
}
