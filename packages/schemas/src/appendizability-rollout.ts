import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const appendizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AppendizabilityRolloutCheckStatus = z.infer<
  typeof appendizabilityRolloutCheckStatusSchema
>

export const appendizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: appendizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AppendizabilityRolloutCheck = z.infer<typeof appendizabilityRolloutCheckSchema>

export const appendizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AppendizabilityRolloutStatus = z.infer<typeof appendizabilityRolloutStatusSchema>

export const appendizabilityCapabilitiesResponseSchema = z.object({
  supportsAppendizabilityRollout: z.literal(true),
  supportsAppendizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAppendizabilitySignals: z.literal(true),
  supportsBillingRecordAppendizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AppendizabilityCapabilitiesResponse = z.infer<
  typeof appendizabilityCapabilitiesResponseSchema
>

export const appendizabilityRolloutResponseSchema = z.object({
  status: appendizabilityRolloutStatusSchema,
  checks: z.array(appendizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AppendizabilityRolloutResponse = z.infer<
  typeof appendizabilityRolloutResponseSchema
>

export function getAppendizabilityRolloutGuidance() {
  return 'Production appendizability rollout validates billing invoice appendizability, billing record appendizability signals, billing webhook coverage, and appendization readiness before production appendizability tooling.'
}
