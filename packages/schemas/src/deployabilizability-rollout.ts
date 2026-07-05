import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deployabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeployabilizabilityRolloutCheckStatus = z.infer<
  typeof deployabilizabilityRolloutCheckStatusSchema
>

export const deployabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deployabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeployabilizabilityRolloutCheck = z.infer<typeof deployabilizabilityRolloutCheckSchema>

export const deployabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeployabilizabilityRolloutStatus = z.infer<typeof deployabilizabilityRolloutStatusSchema>

export const deployabilizabilityCapabilitiesResponseSchema = z.object({
  supportsDeployabilizabilityRollout: z.literal(true),
  supportsDeployabilizabilityAdminTools: z.literal(true),
  supportsModelHealthDeployabilizabilitySignals: z.literal(true),
  supportsModelRegistryDeployabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeployabilizabilityCapabilitiesResponse = z.infer<
  typeof deployabilizabilityCapabilitiesResponseSchema
>

export const deployabilizabilityRolloutResponseSchema = z.object({
  status: deployabilizabilityRolloutStatusSchema,
  checks: z.array(deployabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeployabilizabilityRolloutResponse = z.infer<
  typeof deployabilizabilityRolloutResponseSchema
>

export function getDeployabilizabilityRolloutGuidance() {
  return 'Production deployabilizability rollout validates model health deployabilizability, model registry deployabilizability signals, billing record coverage, and optimization readiness before production deployabilizability tooling.'
}
