import type { ModelHealthEvent, ModelRegistryEntry } from '@ai-war-room/schemas'

export const MODEL_REGISTRY_REPOSITORY = Symbol('MODEL_REGISTRY_REPOSITORY')

export interface ModelRegistryRepository {
  ensureDefaultModels(models: ModelRegistryEntry[]): Promise<void>
  listModels(): Promise<ModelRegistryEntry[]>
  findModel(modelId: string): Promise<ModelRegistryEntry | null>
  markModelDegraded(input: {
    eventId: string
    modelId: string
    reason: string
    now: string
  }): Promise<ModelRegistryEntry | null>
  recoverModel(input: {
    eventId: string
    modelId: string
    reason: string
    now: string
  }): Promise<ModelRegistryEntry | null>
  listHealthEvents(modelId: string): Promise<ModelHealthEvent[]>
}
