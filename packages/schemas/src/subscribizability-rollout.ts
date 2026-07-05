import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const subscribizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SubscribizabilityRolloutCheckStatus = z.infer<
  typeof subscribizabilityRolloutCheckStatusSchema
>

export const subscribizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: subscribizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SubscribizabilityRolloutCheck = z.infer<typeof subscribizabilityRolloutCheckSchema>

export const subscribizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SubscribizabilityRolloutStatus = z.infer<typeof subscribizabilityRolloutStatusSchema>

export const subscribizabilityCapabilitiesResponseSchema = z.object({
  supportsSubscribizabilityRollout: z.literal(true),
  supportsSubscribizabilityAdminTools: z.literal(true),
  supportsBillingWebhookSubscribizabilitySignals: z.literal(true),
  supportsBillingRecordSubscribizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SubscribizabilityCapabilitiesResponse = z.infer<
  typeof subscribizabilityCapabilitiesResponseSchema
>

export const subscribizabilityRolloutResponseSchema = z.object({
  status: subscribizabilityRolloutStatusSchema,
  checks: z.array(subscribizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SubscribizabilityRolloutResponse = z.infer<
  typeof subscribizabilityRolloutResponseSchema
>

export function getSubscribizabilityRolloutGuidance() {
  return 'Production subscribizability rollout validates billing webhook subscribizability, billing record subscribizability signals, usage event coverage, and interpolation readiness before production subscribizability tooling.'
}
