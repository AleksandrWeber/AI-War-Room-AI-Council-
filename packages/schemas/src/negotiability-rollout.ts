import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const negotiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NegotiabilityRolloutCheckStatus = z.infer<
  typeof negotiabilityRolloutCheckStatusSchema
>

export const negotiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: negotiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NegotiabilityRolloutCheck = z.infer<typeof negotiabilityRolloutCheckSchema>

export const negotiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NegotiabilityRolloutStatus = z.infer<typeof negotiabilityRolloutStatusSchema>

export const negotiabilityCapabilitiesResponseSchema = z.object({
  supportsNegotiabilityRollout: z.literal(true),
  supportsNegotiabilityAdminTools: z.literal(true),
  supportsBillingInvoiceNegotiabilitySignals: z.literal(true),
  supportsBillingRecordNegotiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NegotiabilityCapabilitiesResponse = z.infer<
  typeof negotiabilityCapabilitiesResponseSchema
>

export const negotiabilityRolloutResponseSchema = z.object({
  status: negotiabilityRolloutStatusSchema,
  checks: z.array(negotiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NegotiabilityRolloutResponse = z.infer<
  typeof negotiabilityRolloutResponseSchema
>

export function getNegotiabilityRolloutGuidance() {
  return 'Production negotiability rollout validates billing invoice negotiability, billing record negotiability signals, billing webhook coverage, and negotiation readiness before production negotiability tooling.'
}
