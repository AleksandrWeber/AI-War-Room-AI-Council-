import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const releasizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ReleasizabilityRolloutCheckStatus = z.infer<
  typeof releasizabilityRolloutCheckStatusSchema
>

export const releasizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: releasizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ReleasizabilityRolloutCheck = z.infer<typeof releasizabilityRolloutCheckSchema>

export const releasizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ReleasizabilityRolloutStatus = z.infer<typeof releasizabilityRolloutStatusSchema>

export const releasizabilityCapabilitiesResponseSchema = z.object({
  supportsReleasizabilityRollout: z.literal(true),
  supportsReleasizabilityAdminTools: z.literal(true),
  supportsBillingWebhookReleasizabilitySignals: z.literal(true),
  supportsBillingRecordReleasizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ReleasizabilityCapabilitiesResponse = z.infer<
  typeof releasizabilityCapabilitiesResponseSchema
>

export const releasizabilityRolloutResponseSchema = z.object({
  status: releasizabilityRolloutStatusSchema,
  checks: z.array(releasizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ReleasizabilityRolloutResponse = z.infer<
  typeof releasizabilityRolloutResponseSchema
>

export function getReleasizabilityRolloutGuidance() {
  return 'Production releasizability rollout validates billing webhook releasizability, billing record releasizability signals, usage event coverage, and interpolation readiness before production releasizability tooling.'
}
