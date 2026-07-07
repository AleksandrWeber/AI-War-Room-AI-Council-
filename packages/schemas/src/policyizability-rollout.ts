import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const policyizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PolicyizabilityRolloutCheckStatus = z.infer<
  typeof policyizabilityRolloutCheckStatusSchema
>

export const policyizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: policyizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PolicyizabilityRolloutCheck = z.infer<typeof policyizabilityRolloutCheckSchema>

export const policyizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PolicyizabilityRolloutStatus = z.infer<typeof policyizabilityRolloutStatusSchema>

export const policyizabilityCapabilitiesResponseSchema = z.object({
  supportsPolicyizabilityRollout: z.literal(true),
  supportsPolicyizabilityAdminTools: z.literal(true),
  supportsMembershipPolicyizabilitySignals: z.literal(true),
  supportsUsageEventPolicyizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PolicyizabilityCapabilitiesResponse = z.infer<
  typeof policyizabilityCapabilitiesResponseSchema
>

export const policyizabilityRolloutResponseSchema = z.object({
  status: policyizabilityRolloutStatusSchema,
  checks: z.array(policyizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PolicyizabilityRolloutResponse = z.infer<
  typeof policyizabilityRolloutResponseSchema
>

export function getPolicyizabilityRolloutGuidance() {
  return 'Production policyizability rollout validates membership policyizability, usage event policyizability signals, billing notification coverage, and healingization readiness before production policyizability tooling.'
}
