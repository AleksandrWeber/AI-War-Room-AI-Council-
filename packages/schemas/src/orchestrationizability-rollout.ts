import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const orchestrationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OrchestrationizabilityRolloutCheckStatus = z.infer<
  typeof orchestrationizabilityRolloutCheckStatusSchema
>

export const orchestrationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: orchestrationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OrchestrationizabilityRolloutCheck = z.infer<typeof orchestrationizabilityRolloutCheckSchema>

export const orchestrationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OrchestrationizabilityRolloutStatus = z.infer<typeof orchestrationizabilityRolloutStatusSchema>

export const orchestrationizabilityCapabilitiesResponseSchema = z.object({
  supportsOrchestrationizabilityRollout: z.literal(true),
  supportsOrchestrationizabilityAdminTools: z.literal(true),
  supportsBillingWebhookOrchestrationizabilitySignals: z.literal(true),
  supportsBillingRecordOrchestrationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OrchestrationizabilityCapabilitiesResponse = z.infer<
  typeof orchestrationizabilityCapabilitiesResponseSchema
>

export const orchestrationizabilityRolloutResponseSchema = z.object({
  status: orchestrationizabilityRolloutStatusSchema,
  checks: z.array(orchestrationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OrchestrationizabilityRolloutResponse = z.infer<
  typeof orchestrationizabilityRolloutResponseSchema
>

export function getOrchestrationizabilityRolloutGuidance() {
  return 'Production orchestrationizability rollout validates billing webhook orchestrationizability, billing record orchestrationizability signals, usage event coverage, and interpolation readiness before production orchestrationizability tooling.'
}
