import type { ModelHealthEvent, ModelRegistryEntry } from '@ai-war-room/schemas'
import type { ModelRegistryRepository } from './model-registry.repository.js'

export class InMemoryModelRegistryRepository
  implements ModelRegistryRepository
{
  private readonly models = new Map<string, ModelRegistryEntry>()
  private readonly healthEvents: ModelHealthEvent[] = []

  async ensureDefaultModels(models: ModelRegistryEntry[]): Promise<void> {
    for (const model of models) {
      const existing = this.models.get(model.modelId)
      if (!existing) {
        this.models.set(model.modelId, model)
        continue
      }

      this.models.set(model.modelId, {
        ...existing,
        modelName: model.modelName,
        lifecycleStatus: model.lifecycleStatus,
        updatedAt: model.updatedAt,
      })
    }
  }

  async listModels(): Promise<ModelRegistryEntry[]> {
    return [...this.models.values()]
  }

  async findModel(modelId: string): Promise<ModelRegistryEntry | null> {
    return this.models.get(modelId) ?? null
  }

  async markModelDegraded(input: {
    eventId: string
    modelId: string
    reason: string
    now: string
  }): Promise<ModelRegistryEntry | null> {
    const model = this.models.get(input.modelId)

    if (!model) {
      return null
    }

    const consecutiveFailures = model.consecutiveFailures + 1
    const shouldRemoveFromPool = consecutiveFailures >= 3
    const degraded: ModelRegistryEntry = {
      ...model,
      consecutiveFailures,
      lifecycleStatus: shouldRemoveFromPool ? 'degraded' : model.lifecycleStatus,
      healthStatus: shouldRemoveFromPool ? 'degraded' : model.healthStatus,
      updatedAt: input.now,
    }
    this.models.set(input.modelId, degraded)
    this.healthEvents.push({
      eventId: input.eventId,
      modelId: input.modelId,
      eventType: 'degraded',
      reason: input.reason,
      createdAt: input.now,
    })

    return degraded
  }

  async recoverModel(input: {
    eventId: string
    modelId: string
    reason: string
    now: string
  }): Promise<ModelRegistryEntry | null> {
    const model = this.models.get(input.modelId)

    if (!model) {
      return null
    }

    const recovered: ModelRegistryEntry = {
      ...model,
      lifecycleStatus: 'active',
      healthStatus: 'healthy',
      consecutiveFailures: 0,
      updatedAt: input.now,
    }
    this.models.set(input.modelId, recovered)
    this.healthEvents.push({
      eventId: input.eventId,
      modelId: input.modelId,
      eventType: 'recovered',
      reason: input.reason,
      createdAt: input.now,
    })

    return recovered
  }

  async listHealthEvents(modelId: string): Promise<ModelHealthEvent[]> {
    return this.healthEvents.filter((event) => event.modelId === modelId)
  }
}
