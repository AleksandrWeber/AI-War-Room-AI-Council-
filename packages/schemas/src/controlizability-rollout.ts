import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const controlizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ControlizabilityRolloutCheckStatus = z.infer<
  typeof controlizabilityRolloutCheckStatusSchema
>

export const controlizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: controlizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ControlizabilityRolloutCheck = z.infer<typeof controlizabilityRolloutCheckSchema>

export const controlizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ControlizabilityRolloutStatus = z.infer<typeof controlizabilityRolloutStatusSchema>

export const controlizabilityCapabilitiesResponseSchema = z.object({
  supportsControlizabilityRollout: z.literal(true),
  supportsControlizabilityAdminTools: z.literal(true),
  supportsBillingNotificationControlizabilitySignals: z.literal(true),
  supportsBillingWebhookControlizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ControlizabilityCapabilitiesResponse = z.infer<
  typeof controlizabilityCapabilitiesResponseSchema
>

export const controlizabilityRolloutResponseSchema = z.object({
  status: controlizabilityRolloutStatusSchema,
  checks: z.array(controlizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ControlizabilityRolloutResponse = z.infer<
  typeof controlizabilityRolloutResponseSchema
>

export function getControlizabilityRolloutGuidance() {
  return 'Production controlizability rollout validates billing notification controlizability, billing webhook controlizability signals, usage event coverage, and governanceization readiness before production controlizability tooling.'
}
