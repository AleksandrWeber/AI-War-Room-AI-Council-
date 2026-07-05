import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const formulatabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FormulatabilityRolloutCheckStatus = z.infer<
  typeof formulatabilityRolloutCheckStatusSchema
>

export const formulatabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: formulatabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FormulatabilityRolloutCheck = z.infer<typeof formulatabilityRolloutCheckSchema>

export const formulatabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FormulatabilityRolloutStatus = z.infer<typeof formulatabilityRolloutStatusSchema>

export const formulatabilityCapabilitiesResponseSchema = z.object({
  supportsFormulatabilityRollout: z.literal(true),
  supportsFormulatabilityAdminTools: z.literal(true),
  supportsIdempotencyKeyFormulatabilitySignals: z.literal(true),
  supportsUsageEventFormulatabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FormulatabilityCapabilitiesResponse = z.infer<
  typeof formulatabilityCapabilitiesResponseSchema
>

export const formulatabilityRolloutResponseSchema = z.object({
  status: formulatabilityRolloutStatusSchema,
  checks: z.array(formulatabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FormulatabilityRolloutResponse = z.infer<
  typeof formulatabilityRolloutResponseSchema
>

export function getFormulatabilityRolloutGuidance() {
  return 'Production formulatability rollout validates idempotency key formulatability, usage event formulatability signals, billing webhook coverage, and formulation readiness before production formulatability tooling.'
}
