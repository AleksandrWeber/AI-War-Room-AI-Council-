import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deploymentRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeploymentRolloutCheckStatus = z.infer<
  typeof deploymentRolloutCheckStatusSchema
>

export const deploymentRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deploymentRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeploymentRolloutCheck = z.infer<typeof deploymentRolloutCheckSchema>

export const deploymentRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeploymentRolloutStatus = z.infer<typeof deploymentRolloutStatusSchema>

export const deploymentCapabilitiesResponseSchema = z.object({
  supportsDeploymentRollout: z.literal(true),
  supportsDeploymentAdminTools: z.literal(true),
  supportsApiReadinessProbe: z.literal(true),
  supportedDependencies: z.array(z.enum(['postgres', 'redis', 'temporal'])),
  guidance: nonEmptyStringSchema,
})
export type DeploymentCapabilitiesResponse = z.infer<
  typeof deploymentCapabilitiesResponseSchema
>

export const deploymentRolloutResponseSchema = z.object({
  status: deploymentRolloutStatusSchema,
  checks: z.array(deploymentRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeploymentRolloutResponse = z.infer<
  typeof deploymentRolloutResponseSchema
>

export const criticalDeploymentDependencies = ['postgres', 'redis'] as const

export function getDeploymentRolloutGuidance() {
  return 'Deployment health rollout validates API readiness probes, dependency health, and production web origin configuration before production deployment tooling.'
}
