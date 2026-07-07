import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ruleproofizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RuleproofizabilityRolloutCheckStatus = z.infer<
  typeof ruleproofizabilityRolloutCheckStatusSchema
>

export const ruleproofizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ruleproofizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RuleproofizabilityRolloutCheck = z.infer<typeof ruleproofizabilityRolloutCheckSchema>

export const ruleproofizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RuleproofizabilityRolloutStatus = z.infer<typeof ruleproofizabilityRolloutStatusSchema>

export const ruleproofizabilityCapabilitiesResponseSchema = z.object({
  supportsRuleproofizabilityRollout: z.literal(true),
  supportsRuleproofizabilityAdminTools: z.literal(true),
  supportsBillingInvoiceRuleproofizabilitySignals: z.literal(true),
  supportsBillingRecordRuleproofizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RuleproofizabilityCapabilitiesResponse = z.infer<
  typeof ruleproofizabilityCapabilitiesResponseSchema
>

export const ruleproofizabilityRolloutResponseSchema = z.object({
  status: ruleproofizabilityRolloutStatusSchema,
  checks: z.array(ruleproofizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RuleproofizabilityRolloutResponse = z.infer<
  typeof ruleproofizabilityRolloutResponseSchema
>

export function getRuleproofizabilityRolloutGuidance() {
  return 'Production ruleproofizability rollout validates billing invoice ruleproofizability, billing record ruleproofizability signals, billing webhook coverage, and scalingization readiness before production ruleproofizability tooling.'
}
