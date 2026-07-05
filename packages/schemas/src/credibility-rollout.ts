import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const credibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CredibilityRolloutCheckStatus = z.infer<
  typeof credibilityRolloutCheckStatusSchema
>

export const credibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: credibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CredibilityRolloutCheck = z.infer<typeof credibilityRolloutCheckSchema>

export const credibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CredibilityRolloutStatus = z.infer<typeof credibilityRolloutStatusSchema>

export const credibilityCapabilitiesResponseSchema = z.object({
  supportsCredibilityRollout: z.literal(true),
  supportsCredibilityAdminTools: z.literal(true),
  supportsBillingInvoiceCredibilitySignals: z.literal(true),
  supportsBillingRecordCredibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CredibilityCapabilitiesResponse = z.infer<
  typeof credibilityCapabilitiesResponseSchema
>

export const credibilityRolloutResponseSchema = z.object({
  status: credibilityRolloutStatusSchema,
  checks: z.array(credibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CredibilityRolloutResponse = z.infer<
  typeof credibilityRolloutResponseSchema
>

export function getCredibilityRolloutGuidance() {
  return 'Production credibility rollout validates billing invoice credibility, billing record credibility signals, meter usage reporting coverage, and trust readiness before production credibility tooling.'
}
