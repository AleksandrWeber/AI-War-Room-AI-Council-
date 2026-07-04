import type {
  ModelHealthAdminAction,
  ModelHealthAdminRecord,
  ModelHealthAdminStats,
  ModelRegistryEntry,
} from '@ai-war-room/schemas'

export function buildModelHealthAdminStats(
  models: ModelHealthAdminRecord[],
): ModelHealthAdminStats {
  return {
    totalModels: models.length,
    activeModels: models.filter((model) => model.lifecycleStatus === 'active')
      .length,
    degradedModels: models.filter((model) => model.healthStatus === 'degraded')
      .length,
    candidateModels: models.filter(
      (model) => model.lifecycleStatus === 'candidate',
    ).length,
  }
}

export function resolveModelHealthAdminActions(input: {
  models: ModelHealthAdminRecord[]
}) {
  const actions: ModelHealthAdminAction[] = []

  if (input.models.some((model) => model.healthStatus === 'degraded')) {
    actions.push('recover_model')
  }

  return actions
}

export function getModelHealthAdminGuidance(input: {
  availableActions: readonly ModelHealthAdminAction[]
}) {
  if (input.availableActions.includes('recover_model')) {
    return 'Workspace owners and admins can inspect degraded models and recover healthy routing state.'
  }

  return 'Workspace owners and admins can inspect model registry health for production routing.'
}

export function toModelHealthAdminRecord(
  model: ModelRegistryEntry,
): ModelHealthAdminRecord {
  return {
    modelId: model.modelId,
    providerId: model.providerId,
    modelName: model.modelName,
    lifecycleStatus: model.lifecycleStatus,
    healthStatus: model.healthStatus,
    consecutiveFailures: model.consecutiveFailures,
    updatedAt: model.updatedAt,
  }
}
