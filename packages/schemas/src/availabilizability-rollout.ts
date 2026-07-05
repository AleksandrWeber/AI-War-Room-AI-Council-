import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const availabilizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AvailabilizabilityRolloutCheckStatus = z.infer<
  typeof availabilizabilityRolloutCheckStatusSchema
>

export const availabilizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: availabilizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AvailabilizabilityRolloutCheck = z.infer<typeof availabilizabilityRolloutCheckSchema>

export const availabilizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AvailabilizabilityRolloutStatus = z.infer<typeof availabilizabilityRolloutStatusSchema>

export const availabilizabilityCapabilitiesResponseSchema = z.object({
  supportsAvailabilizabilityRollout: z.literal(true),
  supportsAvailabilizabilityAdminTools: z.literal(true),
  supportsShieldScanAvailabilizabilitySignals: z.literal(true),
  supportsProviderCredentialAvailabilizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AvailabilizabilityCapabilitiesResponse = z.infer<
  typeof availabilizabilityCapabilitiesResponseSchema
>

export const availabilizabilityRolloutResponseSchema = z.object({
  status: availabilizabilityRolloutStatusSchema,
  checks: z.array(availabilizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AvailabilizabilityRolloutResponse = z.infer<
  typeof availabilizabilityRolloutResponseSchema
>

export function getAvailabilizabilityRolloutGuidance() {
  return 'Production availabilizability rollout validates shield scan availabilizability, provider credential availabilizability signals, billing webhook coverage, and availabilization readiness before production availabilizability tooling.'
}
