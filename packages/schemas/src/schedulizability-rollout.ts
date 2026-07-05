import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const schedulizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SchedulizabilityRolloutCheckStatus = z.infer<
  typeof schedulizabilityRolloutCheckStatusSchema
>

export const schedulizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: schedulizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SchedulizabilityRolloutCheck = z.infer<typeof schedulizabilityRolloutCheckSchema>

export const schedulizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SchedulizabilityRolloutStatus = z.infer<typeof schedulizabilityRolloutStatusSchema>

export const schedulizabilityCapabilitiesResponseSchema = z.object({
  supportsSchedulizabilityRollout: z.literal(true),
  supportsSchedulizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceSchedulizabilitySignals: z.literal(true),
  supportsBillingRecordSchedulizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SchedulizabilityCapabilitiesResponse = z.infer<
  typeof schedulizabilityCapabilitiesResponseSchema
>

export const schedulizabilityRolloutResponseSchema = z.object({
  status: schedulizabilityRolloutStatusSchema,
  checks: z.array(schedulizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SchedulizabilityRolloutResponse = z.infer<
  typeof schedulizabilityRolloutResponseSchema
>

export function getSchedulizabilityRolloutGuidance() {
  return 'Production schedulizability rollout validates billing invoice schedulizability, billing record schedulizability signals, billing webhook coverage, and schedulization readiness before production schedulizability tooling.'
}
