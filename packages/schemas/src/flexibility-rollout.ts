import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const flexibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FlexibilityRolloutCheckStatus = z.infer<
  typeof flexibilityRolloutCheckStatusSchema
>

export const flexibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: flexibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FlexibilityRolloutCheck = z.infer<typeof flexibilityRolloutCheckSchema>

export const flexibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FlexibilityRolloutStatus = z.infer<typeof flexibilityRolloutStatusSchema>

export const flexibilityCapabilitiesResponseSchema = z.object({
  supportsFlexibilityRollout: z.literal(true),
  supportsFlexibilityAdminTools: z.literal(true),
  supportsWorkflowFlexibilitySignals: z.literal(true),
  supportsUsageEventFlexibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FlexibilityCapabilitiesResponse = z.infer<
  typeof flexibilityCapabilitiesResponseSchema
>

export const flexibilityRolloutResponseSchema = z.object({
  status: flexibilityRolloutStatusSchema,
  checks: z.array(flexibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FlexibilityRolloutResponse = z.infer<
  typeof flexibilityRolloutResponseSchema
>

export function getFlexibilityRolloutGuidance() {
  return 'Production flexibility rollout validates workflow flexibility, usage event flexibility signals, shield scan coverage, and flexibility readiness before production flexibility tooling.'
}
