import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const triggerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TriggerizabilityRolloutCheckStatus = z.infer<
  typeof triggerizabilityRolloutCheckStatusSchema
>

export const triggerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: triggerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TriggerizabilityRolloutCheck = z.infer<typeof triggerizabilityRolloutCheckSchema>

export const triggerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TriggerizabilityRolloutStatus = z.infer<typeof triggerizabilityRolloutStatusSchema>

export const triggerizabilityCapabilitiesResponseSchema = z.object({
  supportsTriggerizabilityRollout: z.literal(true),
  supportsTriggerizabilityAdminTools: z.literal(true),
  supportsBillingNotificationTriggerizabilitySignals: z.literal(true),
  supportsBillingWebhookTriggerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TriggerizabilityCapabilitiesResponse = z.infer<
  typeof triggerizabilityCapabilitiesResponseSchema
>

export const triggerizabilityRolloutResponseSchema = z.object({
  status: triggerizabilityRolloutStatusSchema,
  checks: z.array(triggerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TriggerizabilityRolloutResponse = z.infer<
  typeof triggerizabilityRolloutResponseSchema
>

export function getTriggerizabilityRolloutGuidance() {
  return 'Production triggerizability rollout validates billing notification triggerizability, billing webhook triggerizability signals, usage event coverage, and triggerization readiness before production triggerizability tooling.'
}
