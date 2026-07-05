import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const probabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProbabilizabilityRolloutCheckStatus = z.infer<
  typeof probabilizabilityRolloutCheckStatusSchema
>

export const probabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: probabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProbabilizabilityRolloutCheck = z.infer<typeof probabilizabilityRolloutCheckSchema>

export const probabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProbabilizabilityRolloutStatus = z.infer<typeof probabilizabilityRolloutStatusSchema>

export const probabilizabilityCapabilitiesResponseSchema = z.object({
  supportsProbabilizabilityRollout: z.literal(true),
  supportsProbabilizabilityAdminTools: z.literal(true),
  supportsBillingWebhookProbabilizabilitySignals: z.literal(true),
  supportsBillingRecordProbabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProbabilizabilityCapabilitiesResponse = z.infer<
  typeof probabilizabilityCapabilitiesResponseSchema
>

export const probabilizabilityRolloutResponseSchema = z.object({
  status: probabilizabilityRolloutStatusSchema,
  checks: z.array(probabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProbabilizabilityRolloutResponse = z.infer<
  typeof probabilizabilityRolloutResponseSchema
>

export function getProbabilizabilityRolloutGuidance() {
  return 'Production probabilizability rollout validates billing webhook probabilizability, billing record probabilizability signals, usage event coverage, and probabilization readiness before production probabilizability tooling.'
}
