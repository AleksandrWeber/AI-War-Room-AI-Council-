import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const comparizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ComparizabilityRolloutCheckStatus = z.infer<
  typeof comparizabilityRolloutCheckStatusSchema
>

export const comparizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: comparizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ComparizabilityRolloutCheck = z.infer<typeof comparizabilityRolloutCheckSchema>

export const comparizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ComparizabilityRolloutStatus = z.infer<typeof comparizabilityRolloutStatusSchema>

export const comparizabilityCapabilitiesResponseSchema = z.object({
  supportsComparizabilityRollout: z.literal(true),
  supportsComparizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceComparizabilitySignals: z.literal(true),
  supportsBillingRecordComparizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ComparizabilityCapabilitiesResponse = z.infer<
  typeof comparizabilityCapabilitiesResponseSchema
>

export const comparizabilityRolloutResponseSchema = z.object({
  status: comparizabilityRolloutStatusSchema,
  checks: z.array(comparizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ComparizabilityRolloutResponse = z.infer<
  typeof comparizabilityRolloutResponseSchema
>

export function getComparizabilityRolloutGuidance() {
  return 'Production comparizability rollout validates billing invoice comparizability, billing record comparizability signals, billing webhook coverage, and comparization readiness before production comparizability tooling.'
}
