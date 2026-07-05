import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const enunciabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EnunciabilityRolloutCheckStatus = z.infer<
  typeof enunciabilityRolloutCheckStatusSchema
>

export const enunciabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: enunciabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EnunciabilityRolloutCheck = z.infer<typeof enunciabilityRolloutCheckSchema>

export const enunciabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EnunciabilityRolloutStatus = z.infer<typeof enunciabilityRolloutStatusSchema>

export const enunciabilityCapabilitiesResponseSchema = z.object({
  supportsEnunciabilityRollout: z.literal(true),
  supportsEnunciabilityAdminTools: z.literal(true),
  supportsBillingNotificationEnunciabilitySignals: z.literal(true),
  supportsBillingWebhookEnunciabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EnunciabilityCapabilitiesResponse = z.infer<
  typeof enunciabilityCapabilitiesResponseSchema
>

export const enunciabilityRolloutResponseSchema = z.object({
  status: enunciabilityRolloutStatusSchema,
  checks: z.array(enunciabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EnunciabilityRolloutResponse = z.infer<
  typeof enunciabilityRolloutResponseSchema
>

export function getEnunciabilityRolloutGuidance() {
  return 'Production enunciability rollout validates billing notification enunciability, billing webhook enunciability signals, usage event coverage, and enunciation readiness before production enunciability tooling.'
}
