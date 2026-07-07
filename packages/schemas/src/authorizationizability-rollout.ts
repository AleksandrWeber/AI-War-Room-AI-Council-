import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const authorizationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuthorizationizabilityRolloutCheckStatus = z.infer<
  typeof authorizationizabilityRolloutCheckStatusSchema
>

export const authorizationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: authorizationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuthorizationizabilityRolloutCheck = z.infer<typeof authorizationizabilityRolloutCheckSchema>

export const authorizationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuthorizationizabilityRolloutStatus = z.infer<typeof authorizationizabilityRolloutStatusSchema>

export const authorizationizabilityCapabilitiesResponseSchema = z.object({
  supportsAuthorizationizabilityRollout: z.literal(true),
  supportsAuthorizationizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyAuthorizationizabilitySignals: z.literal(true),
  supportsUsageEventAuthorizationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuthorizationizabilityCapabilitiesResponse = z.infer<
  typeof authorizationizabilityCapabilitiesResponseSchema
>

export const authorizationizabilityRolloutResponseSchema = z.object({
  status: authorizationizabilityRolloutStatusSchema,
  checks: z.array(authorizationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuthorizationizabilityRolloutResponse = z.infer<
  typeof authorizationizabilityRolloutResponseSchema
>

export function getAuthorizationizabilityRolloutGuidance() {
  return 'Production authorizationizability rollout validates idempotency key authorizationizability, usage event authorizationizability signals, billing webhook coverage, and remediationization readiness before production authorizationizability tooling.'
}
