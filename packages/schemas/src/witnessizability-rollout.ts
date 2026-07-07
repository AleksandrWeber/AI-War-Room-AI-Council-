import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const witnessizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WitnessizabilityRolloutCheckStatus = z.infer<
  typeof witnessizabilityRolloutCheckStatusSchema
>

export const witnessizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: witnessizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WitnessizabilityRolloutCheck = z.infer<typeof witnessizabilityRolloutCheckSchema>

export const witnessizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WitnessizabilityRolloutStatus = z.infer<typeof witnessizabilityRolloutStatusSchema>

export const witnessizabilityCapabilitiesResponseSchema = z.object({
  supportsWitnessizabilityRollout: z.literal(true),
  supportsWitnessizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyWitnessizabilitySignals: z.literal(true),
  supportsUsageEventWitnessizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WitnessizabilityCapabilitiesResponse = z.infer<
  typeof witnessizabilityCapabilitiesResponseSchema
>

export const witnessizabilityRolloutResponseSchema = z.object({
  status: witnessizabilityRolloutStatusSchema,
  checks: z.array(witnessizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WitnessizabilityRolloutResponse = z.infer<
  typeof witnessizabilityRolloutResponseSchema
>

export function getWitnessizabilityRolloutGuidance() {
  return 'Production witnessizability rollout validates idempotency key witnessizability, usage event witnessizability signals, billing webhook coverage, and remediationization readiness before production witnessizability tooling.'
}
