import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const throttleizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ThrottleizabilityRolloutCheckStatus = z.infer<
  typeof throttleizabilityRolloutCheckStatusSchema
>

export const throttleizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: throttleizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ThrottleizabilityRolloutCheck = z.infer<typeof throttleizabilityRolloutCheckSchema>

export const throttleizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ThrottleizabilityRolloutStatus = z.infer<typeof throttleizabilityRolloutStatusSchema>

export const throttleizabilityCapabilitiesResponseSchema = z.object({
  supportsThrottleizabilityRollout: z.literal(true),
  supportsThrottleizabilityAdminTools: z.literal(true),
  supportsProviderCredentialThrottleizabilitySignals: z.literal(true),
  supportsModelRegistryThrottleizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ThrottleizabilityCapabilitiesResponse = z.infer<
  typeof throttleizabilityCapabilitiesResponseSchema
>

export const throttleizabilityRolloutResponseSchema = z.object({
  status: throttleizabilityRolloutStatusSchema,
  checks: z.array(throttleizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ThrottleizabilityRolloutResponse = z.infer<
  typeof throttleizabilityRolloutResponseSchema
>

export function getThrottleizabilityRolloutGuidance() {
  return 'Production throttleizability rollout validates provider credential throttleizability, model registry throttleizability signals, billing webhook coverage, and throttleization readiness before production throttleizability tooling.'
}
