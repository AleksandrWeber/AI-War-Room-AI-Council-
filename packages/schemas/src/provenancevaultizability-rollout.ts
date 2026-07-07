import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const provenancevaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProvenancevaultizabilityRolloutCheckStatus = z.infer<
  typeof provenancevaultizabilityRolloutCheckStatusSchema
>

export const provenancevaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: provenancevaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProvenancevaultizabilityRolloutCheck = z.infer<typeof provenancevaultizabilityRolloutCheckSchema>

export const provenancevaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProvenancevaultizabilityRolloutStatus = z.infer<typeof provenancevaultizabilityRolloutStatusSchema>

export const provenancevaultizabilityCapabilitiesResponseSchema = z.object({
  supportsProvenancevaultizabilityRollout: z.literal(true),
  supportsProvenancevaultizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyProvenancevaultizabilitySignals: z.literal(true),
  supportsUsageEventProvenancevaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProvenancevaultizabilityCapabilitiesResponse = z.infer<
  typeof provenancevaultizabilityCapabilitiesResponseSchema
>

export const provenancevaultizabilityRolloutResponseSchema = z.object({
  status: provenancevaultizabilityRolloutStatusSchema,
  checks: z.array(provenancevaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProvenancevaultizabilityRolloutResponse = z.infer<
  typeof provenancevaultizabilityRolloutResponseSchema
>

export function getProvenancevaultizabilityRolloutGuidance() {
  return 'Production provenancevaultizability rollout validates idempotency key provenancevaultizability, usage event provenancevaultizability signals, billing webhook coverage, and remediationization readiness before production provenancevaultizability tooling.'
}
