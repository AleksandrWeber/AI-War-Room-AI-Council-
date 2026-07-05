import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const citationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CitationizabilityRolloutCheckStatus = z.infer<
  typeof citationizabilityRolloutCheckStatusSchema
>

export const citationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: citationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CitationizabilityRolloutCheck = z.infer<typeof citationizabilityRolloutCheckSchema>

export const citationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CitationizabilityRolloutStatus = z.infer<typeof citationizabilityRolloutStatusSchema>

export const citationizabilityCapabilitiesResponseSchema = z.object({
  supportsCitationizabilityRollout: z.literal(true),
  supportsCitationizabilityAdminTools: z.literal(true),
  supportsBillingNotificationCitationizabilitySignals: z.literal(true),
  supportsBillingWebhookCitationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CitationizabilityCapabilitiesResponse = z.infer<
  typeof citationizabilityCapabilitiesResponseSchema
>

export const citationizabilityRolloutResponseSchema = z.object({
  status: citationizabilityRolloutStatusSchema,
  checks: z.array(citationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CitationizabilityRolloutResponse = z.infer<
  typeof citationizabilityRolloutResponseSchema
>

export function getCitationizabilityRolloutGuidance() {
  return 'Production citationizability rollout validates billing notification citationizability, billing webhook citationizability signals, usage event coverage, and citationization readiness before production citationizability tooling.'
}
