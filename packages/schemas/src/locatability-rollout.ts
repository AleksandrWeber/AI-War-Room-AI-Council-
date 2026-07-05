import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const locatabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LocatabilityRolloutCheckStatus = z.infer<
  typeof locatabilityRolloutCheckStatusSchema
>

export const locatabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: locatabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LocatabilityRolloutCheck = z.infer<typeof locatabilityRolloutCheckSchema>

export const locatabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LocatabilityRolloutStatus = z.infer<typeof locatabilityRolloutStatusSchema>

export const locatabilityCapabilitiesResponseSchema = z.object({
  supportsLocatabilityRollout: z.literal(true),
  supportsLocatabilityAdminTools: z.literal(true),
  supportsProviderCredentialLocatabilitySignals: z.literal(true),
  supportsWorkspaceLimitLocatabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LocatabilityCapabilitiesResponse = z.infer<
  typeof locatabilityCapabilitiesResponseSchema
>

export const locatabilityRolloutResponseSchema = z.object({
  status: locatabilityRolloutStatusSchema,
  checks: z.array(locatabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LocatabilityRolloutResponse = z.infer<
  typeof locatabilityRolloutResponseSchema
>

export function getLocatabilityRolloutGuidance() {
  return 'Production locatability rollout validates provider credential locatability, workspace limit locatability signals, usage event coverage, and location readiness before production locatability tooling.'
}
