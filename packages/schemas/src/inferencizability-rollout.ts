import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const inferencizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InferencizabilityRolloutCheckStatus = z.infer<
  typeof inferencizabilityRolloutCheckStatusSchema
>

export const inferencizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: inferencizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InferencizabilityRolloutCheck = z.infer<typeof inferencizabilityRolloutCheckSchema>

export const inferencizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InferencizabilityRolloutStatus = z.infer<typeof inferencizabilityRolloutStatusSchema>

export const inferencizabilityCapabilitiesResponseSchema = z.object({
  supportsInferencizabilityRollout: z.literal(true),
  supportsInferencizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceInferencizabilitySignals: z.literal(true),
  supportsBillingRecordInferencizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InferencizabilityCapabilitiesResponse = z.infer<
  typeof inferencizabilityCapabilitiesResponseSchema
>

export const inferencizabilityRolloutResponseSchema = z.object({
  status: inferencizabilityRolloutStatusSchema,
  checks: z.array(inferencizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InferencizabilityRolloutResponse = z.infer<
  typeof inferencizabilityRolloutResponseSchema
>

export function getInferencizabilityRolloutGuidance() {
  return 'Production inferencizability rollout validates billing invoice inferencizability, billing record inferencizability signals, billing webhook coverage, and inferencization readiness before production inferencizability tooling.'
}
