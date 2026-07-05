import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const conformanceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConformanceRolloutCheckStatus = z.infer<
  typeof conformanceRolloutCheckStatusSchema
>

export const conformanceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: conformanceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConformanceRolloutCheck = z.infer<typeof conformanceRolloutCheckSchema>

export const conformanceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConformanceRolloutStatus = z.infer<typeof conformanceRolloutStatusSchema>

export const conformanceCapabilitiesResponseSchema = z.object({
  supportsConformanceRollout: z.literal(true),
  supportsConformanceAdminTools: z.literal(true),
  supportsShieldScanConformanceSignals: z.literal(true),
  supportsBillingWebhookConformanceSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConformanceCapabilitiesResponse = z.infer<
  typeof conformanceCapabilitiesResponseSchema
>

export const conformanceRolloutResponseSchema = z.object({
  status: conformanceRolloutStatusSchema,
  checks: z.array(conformanceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConformanceRolloutResponse = z.infer<
  typeof conformanceRolloutResponseSchema
>

export function getConformanceRolloutGuidance() {
  return 'Production conformance rollout validates shield scan conformance, billing webhook conformance signals, idempotency key coverage, and conformance readiness before production conformance tooling.'
}
