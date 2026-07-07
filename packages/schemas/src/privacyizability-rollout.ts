import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const privacyizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PrivacyizabilityRolloutCheckStatus = z.infer<
  typeof privacyizabilityRolloutCheckStatusSchema
>

export const privacyizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: privacyizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PrivacyizabilityRolloutCheck = z.infer<typeof privacyizabilityRolloutCheckSchema>

export const privacyizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PrivacyizabilityRolloutStatus = z.infer<typeof privacyizabilityRolloutStatusSchema>

export const privacyizabilityCapabilitiesResponseSchema = z.object({
  supportsPrivacyizabilityRollout: z.literal(true),
  supportsPrivacyizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyPrivacyizabilitySignals: z.literal(true),
  supportsUsageEventPrivacyizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PrivacyizabilityCapabilitiesResponse = z.infer<
  typeof privacyizabilityCapabilitiesResponseSchema
>

export const privacyizabilityRolloutResponseSchema = z.object({
  status: privacyizabilityRolloutStatusSchema,
  checks: z.array(privacyizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PrivacyizabilityRolloutResponse = z.infer<
  typeof privacyizabilityRolloutResponseSchema
>

export function getPrivacyizabilityRolloutGuidance() {
  return 'Production privacyizability rollout validates idempotency key privacyizability, usage event privacyizability signals, billing webhook coverage, and remediationization readiness before production privacyizability tooling.'
}
