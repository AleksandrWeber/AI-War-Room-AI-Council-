import { criticalDeploymentDependencies } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export type DeploymentRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type DeploymentRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: DeploymentRolloutCheck[]
  guidance: string
}

export type DeploymentRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  readinessStatus: 'ready' | 'not_ready'
  dependencies: Array<{ name: string; status: 'up' | 'down' }>
  webOrigin: string
  supportsApiHealthEndpoint: boolean
  supportsApiReadinessProbe: boolean
}

export function evaluateDeploymentRollout(
  input: DeploymentRolloutInput,
): DeploymentRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const downDependencies = input.dependencies.filter(
    (dependency) => dependency.status === 'down',
  )
  const missingDependencies = criticalDeploymentDependencies.filter(
    (name) => !input.dependencies.some((dependency) => dependency.name === name),
  )
  const usesLocalWebOrigin =
    input.webOrigin.includes('127.0.0.1') ||
    input.webOrigin.includes('localhost')

  const checks: DeploymentRolloutCheck[] = [
    {
      name: 'api_health_endpoint',
      label: 'API health endpoint',
      status: input.supportsApiHealthEndpoint ? 'pass' : 'fail',
      detail: input.supportsApiHealthEndpoint
        ? 'API health endpoint responds successfully.'
        : 'API health endpoint is not available.',
    },
    {
      name: 'api_readiness_probe',
      label: 'API readiness probe',
      status: input.supportsApiReadinessProbe ? 'pass' : 'fail',
      detail: input.supportsApiReadinessProbe
        ? 'API readiness probe checks dependency health.'
        : 'API readiness probe is not configured.',
    },
    {
      name: 'dependency_health',
      label: 'Dependency health',
      status: input.readinessStatus === 'ready' ? 'pass' : 'fail',
      detail:
        input.readinessStatus === 'ready'
          ? 'All deployment dependencies are healthy.'
          : downDependencies.length
            ? `Unhealthy dependencies: ${downDependencies.map((dependency) => dependency.name).join(', ')}.`
            : 'Deployment readiness probe reported not ready.',
    },
    {
      name: 'critical_dependency_coverage',
      label: 'Critical dependency coverage',
      status: missingDependencies.length === 0 ? 'pass' : 'fail',
      detail:
        missingDependencies.length === 0
          ? `Deployment health covers ${criticalDeploymentDependencies.length} critical dependencies.`
          : `Missing dependencies: ${missingDependencies.join(', ')}.`,
    },
    {
      name: 'production_web_origin',
      label: 'Production web origin',
      status: !isProduction || !usesLocalWebOrigin ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Production web origin is only enforced in production.'
          : !usesLocalWebOrigin
            ? `Production web origin is configured to ${input.webOrigin}.`
            : 'Production deployment rollout requires a non-local WEB_ORIGIN.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Deployment health rollout checks passed. API readiness and dependency health are ready for production.'
        : 'Deployment health rollout is not ready. Resolve failed checks before relying on production deployment tooling.',
  }
}
