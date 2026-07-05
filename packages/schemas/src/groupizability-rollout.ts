import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const groupizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GroupizabilityRolloutCheckStatus = z.infer<
  typeof groupizabilityRolloutCheckStatusSchema
>

export const groupizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: groupizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GroupizabilityRolloutCheck = z.infer<typeof groupizabilityRolloutCheckSchema>

export const groupizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GroupizabilityRolloutStatus = z.infer<typeof groupizabilityRolloutStatusSchema>

export const groupizabilityCapabilitiesResponseSchema = z.object({
  supportsGroupizabilityRollout: z.literal(true),
  supportsGroupizabilityAdminTools: z.literal(true),
  supportsShieldScanGroupizabilitySignals: z.literal(true),
  supportsProviderCredentialGroupizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GroupizabilityCapabilitiesResponse = z.infer<
  typeof groupizabilityCapabilitiesResponseSchema
>

export const groupizabilityRolloutResponseSchema = z.object({
  status: groupizabilityRolloutStatusSchema,
  checks: z.array(groupizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GroupizabilityRolloutResponse = z.infer<
  typeof groupizabilityRolloutResponseSchema
>

export function getGroupizabilityRolloutGuidance() {
  return 'Production groupizability rollout validates shield scan groupizability, provider credential groupizability signals, billing webhook coverage, and groupization readiness before production groupizability tooling.'
}
