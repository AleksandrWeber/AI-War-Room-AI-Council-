import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const hermeneutizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HermeneutizabilityRolloutCheckStatus = z.infer<
  typeof hermeneutizabilityRolloutCheckStatusSchema
>

export const hermeneutizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: hermeneutizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HermeneutizabilityRolloutCheck = z.infer<typeof hermeneutizabilityRolloutCheckSchema>

export const hermeneutizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HermeneutizabilityRolloutStatus = z.infer<typeof hermeneutizabilityRolloutStatusSchema>

export const hermeneutizabilityCapabilitiesResponseSchema = z.object({
  supportsHermeneutizabilityRollout: z.literal(true),
  supportsHermeneutizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyHermeneutizabilitySignals: z.literal(true),
  supportsUsageEventHermeneutizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HermeneutizabilityCapabilitiesResponse = z.infer<
  typeof hermeneutizabilityCapabilitiesResponseSchema
>

export const hermeneutizabilityRolloutResponseSchema = z.object({
  status: hermeneutizabilityRolloutStatusSchema,
  checks: z.array(hermeneutizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HermeneutizabilityRolloutResponse = z.infer<
  typeof hermeneutizabilityRolloutResponseSchema
>

export function getHermeneutizabilityRolloutGuidance() {
  return 'Production hermeneutizability rollout validates idempotency key hermeneutizability, usage event hermeneutizability signals, billing webhook coverage, and hermeneutic readiness before production hermeneutizability tooling.'
}
