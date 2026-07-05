import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const notifizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NotifizabilityRolloutCheckStatus = z.infer<
  typeof notifizabilityRolloutCheckStatusSchema
>

export const notifizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: notifizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NotifizabilityRolloutCheck = z.infer<typeof notifizabilityRolloutCheckSchema>

export const notifizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NotifizabilityRolloutStatus = z.infer<typeof notifizabilityRolloutStatusSchema>

export const notifizabilityCapabilitiesResponseSchema = z.object({
  supportsNotifizabilityRollout: z.literal(true),
  supportsNotifizabilityAdminTools: z.literal(true),
  supportsBillingNotificationNotifizabilitySignals: z.literal(true),
  supportsBillingWebhookNotifizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NotifizabilityCapabilitiesResponse = z.infer<
  typeof notifizabilityCapabilitiesResponseSchema
>

export const notifizabilityRolloutResponseSchema = z.object({
  status: notifizabilityRolloutStatusSchema,
  checks: z.array(notifizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NotifizabilityRolloutResponse = z.infer<
  typeof notifizabilityRolloutResponseSchema
>

export function getNotifizabilityRolloutGuidance() {
  return 'Production notifizability rollout validates billing notification notifizability, billing webhook notifizability signals, usage event coverage, and notifization readiness before production notifizability tooling.'
}
