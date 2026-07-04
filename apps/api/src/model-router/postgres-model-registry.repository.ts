import { Injectable } from '@nestjs/common'
import {
  type ModelHealthEvent,
  type ModelRegistryEntry,
  modelHealthEventSchema,
  modelRegistryEntrySchema,
} from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type { ModelRegistryRepository } from './model-registry.repository.js'

type ModelRegistryRow = {
  model_id: string
  provider_id: ModelRegistryEntry['providerId']
  model_name: string
  supported_roles: unknown
  context_window_tokens: number
  max_output_tokens: number
  input_cost_per_million_tokens_usd: string
  output_cost_per_million_tokens_usd: string
  latency_p95_ms: number
  evaluation_score: string
  safety_score: string
  reliability_score: string
  lifecycle_status: ModelRegistryEntry['lifecycleStatus']
  health_status: ModelRegistryEntry['healthStatus']
  consecutive_failures: number
  updated_at: Date
}

type ModelHealthEventRow = {
  event_id: string
  model_id: string
  event_type: ModelHealthEvent['eventType']
  reason: string
  created_at: Date
}

@Injectable()
export class PostgresModelRegistryRepository
  implements ModelRegistryRepository
{
  constructor(private readonly postgresService: PostgresService) {}

  async ensureDefaultModels(models: ModelRegistryEntry[]): Promise<void> {
    for (const model of models) {
      await this.postgresService.query(
        `
          INSERT INTO model_registry_entries (
            model_id,
            provider_id,
            model_name,
            supported_roles,
            context_window_tokens,
            max_output_tokens,
            input_cost_per_million_tokens_usd,
            output_cost_per_million_tokens_usd,
            latency_p95_ms,
            evaluation_score,
            safety_score,
            reliability_score,
            lifecycle_status,
            health_status,
            consecutive_failures,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (model_id) DO NOTHING
        `,
        [
          model.modelId,
          model.providerId,
          model.modelName,
          JSON.stringify(model.supportedRoles),
          model.contextWindowTokens,
          model.maxOutputTokens,
          model.inputCostPerMillionTokensUsd,
          model.outputCostPerMillionTokensUsd,
          model.latencyP95Ms,
          model.evaluationScore,
          model.safetyScore,
          model.reliabilityScore,
          model.lifecycleStatus,
          model.healthStatus,
          model.consecutiveFailures,
          model.updatedAt,
        ],
      )
    }
  }

  async listModels(): Promise<ModelRegistryEntry[]> {
    const result = await this.postgresService.query<ModelRegistryRow>(
      `
        SELECT *
        FROM model_registry_entries
        ORDER BY provider_id ASC, model_id ASC
      `,
    )

    return result.rows.map((row) => this.parseModelRow(row))
  }

  async findModel(modelId: string): Promise<ModelRegistryEntry | null> {
    const result = await this.postgresService.query<ModelRegistryRow>(
      `
        SELECT *
        FROM model_registry_entries
        WHERE model_id = $1
        LIMIT 1
      `,
      [modelId],
    )

    return result.rows[0] ? this.parseModelRow(result.rows[0]) : null
  }

  async markModelDegraded(input: {
    eventId: string
    modelId: string
    reason: string
    now: string
  }): Promise<ModelRegistryEntry | null> {
    return this.updateHealth({
      ...input,
      eventType: 'degraded',
      lifecycleStatus: 'degraded',
      healthStatus: 'degraded',
      resetFailures: false,
    })
  }

  async recoverModel(input: {
    eventId: string
    modelId: string
    reason: string
    now: string
  }): Promise<ModelRegistryEntry | null> {
    return this.updateHealth({
      ...input,
      eventType: 'recovered',
      lifecycleStatus: 'active',
      healthStatus: 'healthy',
      resetFailures: true,
    })
  }

  async listHealthEvents(modelId: string): Promise<ModelHealthEvent[]> {
    const result = await this.postgresService.query<ModelHealthEventRow>(
      `
        SELECT *
        FROM model_health_events
        WHERE model_id = $1
        ORDER BY created_at DESC
      `,
      [modelId],
    )

    return result.rows.map((row) =>
      modelHealthEventSchema.parse({
        eventId: row.event_id,
        modelId: row.model_id,
        eventType: row.event_type,
        reason: row.reason,
        createdAt: row.created_at.toISOString(),
      }),
    )
  }

  private async updateHealth(input: {
    eventId: string
    modelId: string
    reason: string
    now: string
    eventType: ModelHealthEvent['eventType']
    lifecycleStatus: ModelRegistryEntry['lifecycleStatus']
    healthStatus: ModelRegistryEntry['healthStatus']
    resetFailures: boolean
  }) {
    return this.postgresService.transaction(async (client) => {
      const result = await client.query<ModelRegistryRow>(
        `
          UPDATE model_registry_entries
          SET lifecycle_status = $2,
              health_status = $3,
              consecutive_failures = CASE
                WHEN $4::BOOLEAN THEN 0
                ELSE consecutive_failures + 1
              END,
              updated_at = $5
          WHERE model_id = $1
          RETURNING *
        `,
        [
          input.modelId,
          input.lifecycleStatus,
          input.healthStatus,
          input.resetFailures,
          input.now,
        ],
      )
      const row = result.rows[0]

      if (!row) {
        return null
      }

      await client.query(
        `
          INSERT INTO model_health_events (
            event_id,
            model_id,
            event_type,
            reason,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          input.eventId,
          input.modelId,
          input.eventType,
          input.reason,
          input.now,
        ],
      )

      return this.parseModelRow(row)
    })
  }

  private parseModelRow(row: ModelRegistryRow): ModelRegistryEntry {
    return modelRegistryEntrySchema.parse({
      modelId: row.model_id,
      providerId: row.provider_id,
      modelName: row.model_name,
      supportedRoles: row.supported_roles,
      contextWindowTokens: row.context_window_tokens,
      maxOutputTokens: row.max_output_tokens,
      inputCostPerMillionTokensUsd: Number(row.input_cost_per_million_tokens_usd),
      outputCostPerMillionTokensUsd: Number(
        row.output_cost_per_million_tokens_usd,
      ),
      latencyP95Ms: row.latency_p95_ms,
      evaluationScore: Number(row.evaluation_score),
      safetyScore: Number(row.safety_score),
      reliabilityScore: Number(row.reliability_score),
      lifecycleStatus: row.lifecycle_status,
      healthStatus: row.health_status,
      consecutiveFailures: row.consecutive_failures,
      updatedAt: row.updated_at.toISOString(),
    })
  }
}
