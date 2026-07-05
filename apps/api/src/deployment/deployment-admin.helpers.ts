import type {
  DependencyHealth,
  DeploymentAdminAction,
  DeploymentAdminStats,
  ReadinessResponse,
} from '@ai-war-room/schemas'

export function buildDeploymentAdminStats(input: {
  readiness: ReadinessResponse
  apiVersion: string
}): DeploymentAdminStats {
  const healthyDependencyCount = input.readiness.dependencies.filter(
    (dependency) => dependency.status === 'up',
  ).length

  return {
    readinessStatus: input.readiness.status,
    healthyDependencyCount,
    totalDependencies: input.readiness.dependencies.length,
    apiVersion: input.apiVersion,
  }
}

export function getDeploymentAdminGuidance(input: {
  stats: DeploymentAdminStats
}) {
  if (input.stats.readinessStatus !== 'ready') {
    return 'Workspace owners and admins can inspect deployment health after dependency readiness checks pass.'
  }

  return 'Workspace owners and admins can inspect API readiness, dependency health, and deployment configuration.'
}

export function resolveDeploymentAdminActions(): DeploymentAdminAction[] {
  return ['refresh_deployment_summary']
}

export function formatDependencyLabel(dependency: DependencyHealth) {
  switch (dependency.name) {
    case 'postgres':
      return 'PostgreSQL'
    case 'redis':
      return 'Redis'
  }
}
