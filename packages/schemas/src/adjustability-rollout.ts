import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const adjustabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AdjustabilityRolloutCheckStatus = z.infer<
  typeof adjustabilityRolloutCheckStatusSchema
>

export const adjustabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: adjustabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AdjustabilityRolloutCheck = z.infer<typeof adjustabilityRolloutCheckSchema>

export const adjustabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AdjustabilityRolloutStatus = z.infer<typeof adjustabilityRolloutStatusSchema>

export const adjustabilityCapabilitiesResponseSchema = z.object({
  supportsAdjustabilityRollout: z.literal(true),
  supportsAdjustabilityAdminTools: z.literal(true),
  supportsBillingInvoiceAdjustabilitySignals: z.literal(true),
  supportsMeterUsageAdjustabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AdjustabilityCapabilitiesResponse = z.infer<
  typeof adjustabilityCapabilitiesResponseSchema
>

export const adjustabilityRolloutResponseSchema = z.object({
  status: adjustabilityRolloutStatusSchema,
  checks: z.array(adjustabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AdjustabilityRolloutResponse = z.infer<
  typeof adjustabilityRolloutResponseSchema
>

export function getAdjustabilityRolloutGuidance() {
  return 'Production adjustability rollout validates billing invoice adjustability, meter usage adjustability signals, workspace membership coverage, and adjustment readiness before production adjustability tooling.'
}
