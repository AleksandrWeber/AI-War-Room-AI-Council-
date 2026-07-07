import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const identityizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IdentityizabilityRolloutCheckStatus = z.infer<
  typeof identityizabilityRolloutCheckStatusSchema
>

export const identityizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: identityizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IdentityizabilityRolloutCheck = z.infer<typeof identityizabilityRolloutCheckSchema>

export const identityizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IdentityizabilityRolloutStatus = z.infer<typeof identityizabilityRolloutStatusSchema>

export const identityizabilityCapabilitiesResponseSchema = z.object({
  supportsIdentityizabilityRollout: z.literal(true),
  supportsIdentityizabilityAdminTools: z.literal(true),
  supportsBillingNotificationIdentityizabilitySignals: z.literal(true),
  supportsBillingWebhookIdentityizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IdentityizabilityCapabilitiesResponse = z.infer<
  typeof identityizabilityCapabilitiesResponseSchema
>

export const identityizabilityRolloutResponseSchema = z.object({
  status: identityizabilityRolloutStatusSchema,
  checks: z.array(identityizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IdentityizabilityRolloutResponse = z.infer<
  typeof identityizabilityRolloutResponseSchema
>

export function getIdentityizabilityRolloutGuidance() {
  return 'Production identityizability rollout validates billing notification identityizability, billing webhook identityizability signals, usage event coverage, and governanceization readiness before production identityizability tooling.'
}
