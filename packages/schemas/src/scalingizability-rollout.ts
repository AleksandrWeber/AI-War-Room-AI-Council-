import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const scalingizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ScalingizabilityRolloutCheckStatus = z.infer<
  typeof scalingizabilityRolloutCheckStatusSchema
>

export const scalingizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: scalingizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ScalingizabilityRolloutCheck = z.infer<typeof scalingizabilityRolloutCheckSchema>

export const scalingizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ScalingizabilityRolloutStatus = z.infer<typeof scalingizabilityRolloutStatusSchema>

export const scalingizabilityCapabilitiesResponseSchema = z.object({
  supportsScalingizabilityRollout: z.literal(true),
  supportsScalingizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceScalingizabilitySignals: z.literal(true),
  supportsBillingRecordScalingizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ScalingizabilityCapabilitiesResponse = z.infer<
  typeof scalingizabilityCapabilitiesResponseSchema
>

export const scalingizabilityRolloutResponseSchema = z.object({
  status: scalingizabilityRolloutStatusSchema,
  checks: z.array(scalingizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ScalingizabilityRolloutResponse = z.infer<
  typeof scalingizabilityRolloutResponseSchema
>

export function getScalingizabilityRolloutGuidance() {
  return 'Production scalingizability rollout validates billing invoice scalingizability, billing record scalingizability signals, billing webhook coverage, and scalingization readiness before production scalingizability tooling.'
}
