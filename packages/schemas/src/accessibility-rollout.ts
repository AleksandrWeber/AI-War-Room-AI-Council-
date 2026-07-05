import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const accessibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AccessibilityRolloutCheckStatus = z.infer<
  typeof accessibilityRolloutCheckStatusSchema
>

export const accessibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: accessibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AccessibilityRolloutCheck = z.infer<typeof accessibilityRolloutCheckSchema>

export const accessibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AccessibilityRolloutStatus = z.infer<typeof accessibilityRolloutStatusSchema>

export const accessibilityCapabilitiesResponseSchema = z.object({
  supportsAccessibilityRollout: z.literal(true),
  supportsAccessibilityAdminTools: z.literal(true),
  supportsIdempotencyKeyAccessibilitySignals: z.literal(true),
  supportsUsageEventAccessibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AccessibilityCapabilitiesResponse = z.infer<
  typeof accessibilityCapabilitiesResponseSchema
>

export const accessibilityRolloutResponseSchema = z.object({
  status: accessibilityRolloutStatusSchema,
  checks: z.array(accessibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AccessibilityRolloutResponse = z.infer<
  typeof accessibilityRolloutResponseSchema
>

export function getAccessibilityRolloutGuidance() {
  return 'Production accessibility rollout validates idempotency key accessibility, usage event accessibility signals, billing webhook coverage, and access readiness before production accessibility tooling.'
}
