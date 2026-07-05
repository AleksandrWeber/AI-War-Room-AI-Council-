import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const emblemizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EmblemizabilityRolloutCheckStatus = z.infer<
  typeof emblemizabilityRolloutCheckStatusSchema
>

export const emblemizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: emblemizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EmblemizabilityRolloutCheck = z.infer<typeof emblemizabilityRolloutCheckSchema>

export const emblemizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EmblemizabilityRolloutStatus = z.infer<typeof emblemizabilityRolloutStatusSchema>

export const emblemizabilityCapabilitiesResponseSchema = z.object({
  supportsEmblemizabilityRollout: z.literal(true),
  supportsEmblemizabilityAdminTools: z.literal(true),
  supportsBillingNotificationEmblemizabilitySignals: z.literal(true),
  supportsBillingWebhookEmblemizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EmblemizabilityCapabilitiesResponse = z.infer<
  typeof emblemizabilityCapabilitiesResponseSchema
>

export const emblemizabilityRolloutResponseSchema = z.object({
  status: emblemizabilityRolloutStatusSchema,
  checks: z.array(emblemizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EmblemizabilityRolloutResponse = z.infer<
  typeof emblemizabilityRolloutResponseSchema
>

export function getEmblemizabilityRolloutGuidance() {
  return 'Production emblemizability rollout validates billing notification emblemizability, billing webhook emblemizability signals, usage event coverage, and emblemization readiness before production emblemizability tooling.'
}
