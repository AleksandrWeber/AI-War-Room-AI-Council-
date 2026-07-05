import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const isolatizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IsolatizabilityRolloutCheckStatus = z.infer<
  typeof isolatizabilityRolloutCheckStatusSchema
>

export const isolatizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: isolatizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IsolatizabilityRolloutCheck = z.infer<typeof isolatizabilityRolloutCheckSchema>

export const isolatizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IsolatizabilityRolloutStatus = z.infer<typeof isolatizabilityRolloutStatusSchema>

export const isolatizabilityCapabilitiesResponseSchema = z.object({
  supportsIsolatizabilityRollout: z.literal(true),
  supportsIsolatizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyIsolatizabilitySignals: z.literal(true),
  supportsUsageEventIsolatizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IsolatizabilityCapabilitiesResponse = z.infer<
  typeof isolatizabilityCapabilitiesResponseSchema
>

export const isolatizabilityRolloutResponseSchema = z.object({
  status: isolatizabilityRolloutStatusSchema,
  checks: z.array(isolatizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IsolatizabilityRolloutResponse = z.infer<
  typeof isolatizabilityRolloutResponseSchema
>

export function getIsolatizabilityRolloutGuidance() {
  return 'Production isolatizability rollout validates idempotency key isolatizability, usage event isolatizability signals, billing webhook coverage, and isolatization readiness before production isolatizability tooling.'
}
