import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const falsifiizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FalsifiizabilityRolloutCheckStatus = z.infer<
  typeof falsifiizabilityRolloutCheckStatusSchema
>

export const falsifiizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: falsifiizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FalsifiizabilityRolloutCheck = z.infer<typeof falsifiizabilityRolloutCheckSchema>

export const falsifiizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FalsifiizabilityRolloutStatus = z.infer<typeof falsifiizabilityRolloutStatusSchema>

export const falsifiizabilityCapabilitiesResponseSchema = z.object({
  supportsFalsifiizabilityRollout: z.literal(true),
  supportsFalsifiizabilityAdminTools: z.literal(true),
  supportsBillingNotificationFalsifiizabilitySignals: z.literal(true),
  supportsBillingWebhookFalsifiizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FalsifiizabilityCapabilitiesResponse = z.infer<
  typeof falsifiizabilityCapabilitiesResponseSchema
>

export const falsifiizabilityRolloutResponseSchema = z.object({
  status: falsifiizabilityRolloutStatusSchema,
  checks: z.array(falsifiizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FalsifiizabilityRolloutResponse = z.infer<
  typeof falsifiizabilityRolloutResponseSchema
>

export function getFalsifiizabilityRolloutGuidance() {
  return 'Production falsifiizability rollout validates billing notification falsifiizability, billing webhook falsifiizability signals, usage event coverage, and falsifiization readiness before production falsifiizability tooling.'
}
