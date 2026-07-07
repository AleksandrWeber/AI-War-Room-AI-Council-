import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const policyproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type PolicyproofizabilityRolloutCheckStatus = z.infer<
  typeof policyproofizabilityRolloutCheckStatusSchema
>

export const policyproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: policyproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type PolicyproofizabilityRolloutCheck = z.infer<typeof policyproofizabilityRolloutCheckSchema>

export const policyproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type PolicyproofizabilityRolloutStatus = z.infer<typeof policyproofizabilityRolloutStatusSchema>

export const policyproofizabilityCapabilitiesResponseSchema = z.object({
  supportsPolicyproofizabilityRollout: z.literal(true),
  supportsPolicyproofizabilityAdminTools: z.literal(true),
  supportsBillingInvoicePolicyproofizabilitySignals: z.literal(true),
  supportsBillingRecordPolicyproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type PolicyproofizabilityCapabilitiesResponse = z.infer<
  typeof policyproofizabilityCapabilitiesResponseSchema
>

export const policyproofizabilityRolloutResponseSchema = z.object({
  status: policyproofizabilityRolloutStatusSchema,
  checks: z.array(policyproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type PolicyproofizabilityRolloutResponse = z.infer<
  typeof policyproofizabilityRolloutResponseSchema
>

export function getPolicyproofizabilityRolloutGuidance() {
  return 'Production policyproofizability rollout validates billing invoice policyproofizability, billing record policyproofizability signals, billing webhook coverage, and scalingization readiness before production policyproofizability tooling.'
}
