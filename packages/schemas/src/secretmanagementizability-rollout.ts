import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const secretmanagementizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SecretmanagementizabilityRolloutCheckStatus = z.infer<
  typeof secretmanagementizabilityRolloutCheckStatusSchema
>

export const secretmanagementizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: secretmanagementizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SecretmanagementizabilityRolloutCheck = z.infer<typeof secretmanagementizabilityRolloutCheckSchema>

export const secretmanagementizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SecretmanagementizabilityRolloutStatus = z.infer<typeof secretmanagementizabilityRolloutStatusSchema>

export const secretmanagementizabilityCapabilitiesResponseSchema = z.object({
  supportsSecretmanagementizabilityRollout: z.literal(true),
  supportsSecretmanagementizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeySecretmanagementizabilitySignals: z.literal(true),
  supportsUsageEventSecretmanagementizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SecretmanagementizabilityCapabilitiesResponse = z.infer<
  typeof secretmanagementizabilityCapabilitiesResponseSchema
>

export const secretmanagementizabilityRolloutResponseSchema = z.object({
  status: secretmanagementizabilityRolloutStatusSchema,
  checks: z.array(secretmanagementizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SecretmanagementizabilityRolloutResponse = z.infer<
  typeof secretmanagementizabilityRolloutResponseSchema
>

export function getSecretmanagementizabilityRolloutGuidance() {
  return 'Production secretmanagementizability rollout validates idempotency key secretmanagementizability, usage event secretmanagementizability signals, billing webhook coverage, and remediationization readiness before production secretmanagementizability tooling.'
}
