import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dependableizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DependableizabilityRolloutCheckStatus = z.infer<
  typeof dependableizabilityRolloutCheckStatusSchema
>

export const dependableizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: dependableizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DependableizabilityRolloutCheck = z.infer<typeof dependableizabilityRolloutCheckSchema>

export const dependableizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DependableizabilityRolloutStatus = z.infer<typeof dependableizabilityRolloutStatusSchema>

export const dependableizabilityCapabilitiesResponseSchema = z.object({
  supportsDependableizabilityRollout: z.literal(true),
  supportsDependableizabilityAdminTools: z.literal(true),
  supportsBillingNotificationDependableizabilitySignals: z.literal(true),
  supportsBillingWebhookDependableizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DependableizabilityCapabilitiesResponse = z.infer<
  typeof dependableizabilityCapabilitiesResponseSchema
>

export const dependableizabilityRolloutResponseSchema = z.object({
  status: dependableizabilityRolloutStatusSchema,
  checks: z.array(dependableizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DependableizabilityRolloutResponse = z.infer<
  typeof dependableizabilityRolloutResponseSchema
>

export function getDependableizabilityRolloutGuidance() {
  return 'Production dependableizability rollout validates billing notification dependableizability, billing webhook dependableizability signals, usage event coverage, and dependabilization readiness before production dependableizability tooling.'
}
