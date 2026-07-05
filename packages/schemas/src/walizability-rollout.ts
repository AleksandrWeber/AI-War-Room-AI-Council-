import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const walizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type WalizabilityRolloutCheckStatus = z.infer<
  typeof walizabilityRolloutCheckStatusSchema
>

export const walizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: walizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type WalizabilityRolloutCheck = z.infer<typeof walizabilityRolloutCheckSchema>

export const walizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type WalizabilityRolloutStatus = z.infer<typeof walizabilityRolloutStatusSchema>

export const walizabilityCapabilitiesResponseSchema = z.object({
  supportsWalizabilityRollout: z.literal(true),
  supportsWalizabilityAdminTools: z.literal(true),
  supportsBillingNotificationWalizabilitySignals: z.literal(true),
  supportsBillingWebhookWalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type WalizabilityCapabilitiesResponse = z.infer<
  typeof walizabilityCapabilitiesResponseSchema
>

export const walizabilityRolloutResponseSchema = z.object({
  status: walizabilityRolloutStatusSchema,
  checks: z.array(walizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type WalizabilityRolloutResponse = z.infer<
  typeof walizabilityRolloutResponseSchema
>

export function getWalizabilityRolloutGuidance() {
  return 'Production walizability rollout validates billing notification walizability, billing webhook walizability signals, usage event coverage, and walization readiness before production walizability tooling.'
}
