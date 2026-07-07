import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const transparencyizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TransparencyizabilityRolloutCheckStatus = z.infer<
  typeof transparencyizabilityRolloutCheckStatusSchema
>

export const transparencyizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: transparencyizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TransparencyizabilityRolloutCheck = z.infer<typeof transparencyizabilityRolloutCheckSchema>

export const transparencyizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TransparencyizabilityRolloutStatus = z.infer<typeof transparencyizabilityRolloutStatusSchema>

export const transparencyizabilityCapabilitiesResponseSchema = z.object({
  supportsTransparencyizabilityRollout: z.literal(true),
  supportsTransparencyizabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyTransparencyizabilitySignals: z.literal(true),
  supportsUsageEventTransparencyizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TransparencyizabilityCapabilitiesResponse = z.infer<
  typeof transparencyizabilityCapabilitiesResponseSchema
>

export const transparencyizabilityRolloutResponseSchema = z.object({
  status: transparencyizabilityRolloutStatusSchema,
  checks: z.array(transparencyizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TransparencyizabilityRolloutResponse = z.infer<
  typeof transparencyizabilityRolloutResponseSchema
>

export function getTransparencyizabilityRolloutGuidance() {
  return 'Production transparencyizability rollout validates idempotency key transparencyizability, usage event transparencyizability signals, billing webhook coverage, and remediationization readiness before production transparencyizability tooling.'
}
