import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const expandizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ExpandizabilityRolloutCheckStatus = z.infer<
  typeof expandizabilityRolloutCheckStatusSchema
>

export const expandizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: expandizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ExpandizabilityRolloutCheck = z.infer<typeof expandizabilityRolloutCheckSchema>

export const expandizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ExpandizabilityRolloutStatus = z.infer<typeof expandizabilityRolloutStatusSchema>

export const expandizabilityCapabilitiesResponseSchema = z.object({
  supportsExpandizabilityRollout: z.literal(true),
  supportsExpandizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceExpandizabilitySignals: z.literal(true),
  supportsBillingRecordExpandizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ExpandizabilityCapabilitiesResponse = z.infer<
  typeof expandizabilityCapabilitiesResponseSchema
>

export const expandizabilityRolloutResponseSchema = z.object({
  status: expandizabilityRolloutStatusSchema,
  checks: z.array(expandizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ExpandizabilityRolloutResponse = z.infer<
  typeof expandizabilityRolloutResponseSchema
>

export function getExpandizabilityRolloutGuidance() {
  return 'Production expandizability rollout validates billing invoice expandizability, billing record expandizability signals, billing webhook coverage, and expandization readiness before production expandizability tooling.'
}
