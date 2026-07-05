import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const splitizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SplitizabilityRolloutCheckStatus = z.infer<
  typeof splitizabilityRolloutCheckStatusSchema
>

export const splitizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: splitizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SplitizabilityRolloutCheck = z.infer<typeof splitizabilityRolloutCheckSchema>

export const splitizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SplitizabilityRolloutStatus = z.infer<typeof splitizabilityRolloutStatusSchema>

export const splitizabilityCapabilitiesResponseSchema = z.object({
  supportsSplitizabilityRollout: z.literal(true),
  supportsSplitizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceSplitizabilitySignals: z.literal(true),
  supportsBillingRecordSplitizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SplitizabilityCapabilitiesResponse = z.infer<
  typeof splitizabilityCapabilitiesResponseSchema
>

export const splitizabilityRolloutResponseSchema = z.object({
  status: splitizabilityRolloutStatusSchema,
  checks: z.array(splitizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SplitizabilityRolloutResponse = z.infer<
  typeof splitizabilityRolloutResponseSchema
>

export function getSplitizabilityRolloutGuidance() {
  return 'Production splitizability rollout validates billing invoice splitizability, billing record splitizability signals, billing webhook coverage, and splitization readiness before production splitizability tooling.'
}
