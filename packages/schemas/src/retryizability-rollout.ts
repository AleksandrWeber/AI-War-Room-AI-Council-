import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const retryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RetryizabilityRolloutCheckStatus = z.infer<
  typeof retryizabilityRolloutCheckStatusSchema
>

export const retryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: retryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RetryizabilityRolloutCheck = z.infer<typeof retryizabilityRolloutCheckSchema>

export const retryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RetryizabilityRolloutStatus = z.infer<typeof retryizabilityRolloutStatusSchema>

export const retryizabilityCapabilitiesResponseSchema = z.object({
  supportsRetryizabilityRollout: z.literal(true),
  supportsRetryizabilityAdminTools: z.literal(true),
  supportsMembershipRetryizabilitySignals: z.literal(true),
  supportsUsageEventRetryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RetryizabilityCapabilitiesResponse = z.infer<
  typeof retryizabilityCapabilitiesResponseSchema
>

export const retryizabilityRolloutResponseSchema = z.object({
  status: retryizabilityRolloutStatusSchema,
  checks: z.array(retryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RetryizabilityRolloutResponse = z.infer<
  typeof retryizabilityRolloutResponseSchema
>

export function getRetryizabilityRolloutGuidance() {
  return 'Production retryizability rollout validates membership retryizability, usage event retryizability signals, billing notification coverage, and retryization readiness before production retryizability tooling.'
}
