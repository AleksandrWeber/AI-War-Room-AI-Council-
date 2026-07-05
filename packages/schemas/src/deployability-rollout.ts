import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deployabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeployabilityRolloutCheckStatus = z.infer<
  typeof deployabilityRolloutCheckStatusSchema
>

export const deployabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deployabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeployabilityRolloutCheck = z.infer<typeof deployabilityRolloutCheckSchema>

export const deployabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeployabilityRolloutStatus = z.infer<typeof deployabilityRolloutStatusSchema>

export const deployabilityCapabilitiesResponseSchema = z.object({
  supportsDeployabilityRollout: z.literal(true),
  supportsDeployabilityAdminTools: z.literal(true),
  supportsProviderCredentialDeployabilitySignals: z.literal(true),
  supportsBillingWebhookDeployabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeployabilityCapabilitiesResponse = z.infer<
  typeof deployabilityCapabilitiesResponseSchema
>

export const deployabilityRolloutResponseSchema = z.object({
  status: deployabilityRolloutStatusSchema,
  checks: z.array(deployabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeployabilityRolloutResponse = z.infer<
  typeof deployabilityRolloutResponseSchema
>

export function getDeployabilityRolloutGuidance() {
  return 'Production deployability rollout validates provider credential deployability, billing webhook deployability signals, usage event coverage, and deployment readiness before production deployability tooling.'
}
