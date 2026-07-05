import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ttlizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TtlizabilityRolloutCheckStatus = z.infer<
  typeof ttlizabilityRolloutCheckStatusSchema
>

export const ttlizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ttlizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TtlizabilityRolloutCheck = z.infer<typeof ttlizabilityRolloutCheckSchema>

export const ttlizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TtlizabilityRolloutStatus = z.infer<typeof ttlizabilityRolloutStatusSchema>

export const ttlizabilityCapabilitiesResponseSchema = z.object({
  supportsTtlizabilityRollout: z.literal(true),
  supportsTtlizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceTtlizabilitySignals: z.literal(true),
  supportsBillingRecordTtlizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TtlizabilityCapabilitiesResponse = z.infer<
  typeof ttlizabilityCapabilitiesResponseSchema
>

export const ttlizabilityRolloutResponseSchema = z.object({
  status: ttlizabilityRolloutStatusSchema,
  checks: z.array(ttlizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TtlizabilityRolloutResponse = z.infer<
  typeof ttlizabilityRolloutResponseSchema
>

export function getTtlizabilityRolloutGuidance() {
  return 'Production ttlizability rollout validates billing invoice ttlizability, billing record ttlizability signals, billing webhook coverage, and ttlization readiness before production ttlizability tooling.'
}
