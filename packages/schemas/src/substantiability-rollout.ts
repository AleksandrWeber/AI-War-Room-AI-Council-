import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const substantiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SubstantiabilityRolloutCheckStatus = z.infer<
  typeof substantiabilityRolloutCheckStatusSchema
>

export const substantiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: substantiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SubstantiabilityRolloutCheck = z.infer<typeof substantiabilityRolloutCheckSchema>

export const substantiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SubstantiabilityRolloutStatus = z.infer<typeof substantiabilityRolloutStatusSchema>

export const substantiabilityCapabilitiesResponseSchema = z.object({
  supportsSubstantiabilityRollout: z.literal(true),
  supportsSubstantiabilityAdminTools: z.literal(true),
  supportsBillingRecordSubstantiabilitySignals: z.literal(true),
  supportsBillingWebhookSubstantiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SubstantiabilityCapabilitiesResponse = z.infer<
  typeof substantiabilityCapabilitiesResponseSchema
>

export const substantiabilityRolloutResponseSchema = z.object({
  status: substantiabilityRolloutStatusSchema,
  checks: z.array(substantiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SubstantiabilityRolloutResponse = z.infer<
  typeof substantiabilityRolloutResponseSchema
>

export function getSubstantiabilityRolloutGuidance() {
  return 'Production substantiability rollout validates billing record substantiability, billing webhook substantiability signals, idempotency coverage, and substantiation readiness before production substantiability tooling.'
}
