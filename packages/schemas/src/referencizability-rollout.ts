import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const referencizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReferencizabilityRolloutCheckStatus = z.infer<
  typeof referencizabilityRolloutCheckStatusSchema
>

export const referencizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: referencizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReferencizabilityRolloutCheck = z.infer<typeof referencizabilityRolloutCheckSchema>

export const referencizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReferencizabilityRolloutStatus = z.infer<typeof referencizabilityRolloutStatusSchema>

export const referencizabilityCapabilitiesResponseSchema = z.object({
  supportsReferencizabilityRollout: z.literal(true),
  supportsReferencizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyReferencizabilitySignals: z.literal(true),
  supportsUsageEventReferencizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReferencizabilityCapabilitiesResponse = z.infer<
  typeof referencizabilityCapabilitiesResponseSchema
>

export const referencizabilityRolloutResponseSchema = z.object({
  status: referencizabilityRolloutStatusSchema,
  checks: z.array(referencizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReferencizabilityRolloutResponse = z.infer<
  typeof referencizabilityRolloutResponseSchema
>

export function getReferencizabilityRolloutGuidance() {
  return 'Production referencizability rollout validates idempotency key referencizability, usage event referencizability signals, billing webhook coverage, and referencization readiness before production referencizability tooling.'
}
