import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const concretizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConcretizabilityRolloutCheckStatus = z.infer<
  typeof concretizabilityRolloutCheckStatusSchema
>

export const concretizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: concretizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConcretizabilityRolloutCheck = z.infer<typeof concretizabilityRolloutCheckSchema>

export const concretizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConcretizabilityRolloutStatus = z.infer<typeof concretizabilityRolloutStatusSchema>

export const concretizabilityCapabilitiesResponseSchema = z.object({
  supportsConcretizabilityRollout: z.literal(true),
  supportsConcretizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyConcretizabilitySignals: z.literal(true),
  supportsUsageEventConcretizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConcretizabilityCapabilitiesResponse = z.infer<
  typeof concretizabilityCapabilitiesResponseSchema
>

export const concretizabilityRolloutResponseSchema = z.object({
  status: concretizabilityRolloutStatusSchema,
  checks: z.array(concretizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConcretizabilityRolloutResponse = z.infer<
  typeof concretizabilityRolloutResponseSchema
>

export function getConcretizabilityRolloutGuidance() {
  return 'Production concretizability rollout validates idempotency key concretizability, usage event concretizability signals, billing webhook coverage, and concretization readiness before production concretizability tooling.'
}
