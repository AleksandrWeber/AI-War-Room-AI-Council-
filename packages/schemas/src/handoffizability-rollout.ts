import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const handoffizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HandoffizabilityRolloutCheckStatus = z.infer<
  typeof handoffizabilityRolloutCheckStatusSchema
>

export const handoffizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: handoffizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HandoffizabilityRolloutCheck = z.infer<typeof handoffizabilityRolloutCheckSchema>

export const handoffizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HandoffizabilityRolloutStatus = z.infer<typeof handoffizabilityRolloutStatusSchema>

export const handoffizabilityCapabilitiesResponseSchema = z.object({
  supportsHandoffizabilityRollout: z.literal(true),
  supportsHandoffizabilityAdminTools: z.literal(true),
  supportsShieldScanHandoffizabilitySignals: z.literal(true),
  supportsProviderCredentialHandoffizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HandoffizabilityCapabilitiesResponse = z.infer<
  typeof handoffizabilityCapabilitiesResponseSchema
>

export const handoffizabilityRolloutResponseSchema = z.object({
  status: handoffizabilityRolloutStatusSchema,
  checks: z.array(handoffizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HandoffizabilityRolloutResponse = z.infer<
  typeof handoffizabilityRolloutResponseSchema
>

export function getHandoffizabilityRolloutGuidance() {
  return 'Production handoffizability rollout validates shield scan handoffizability, provider credential handoffizability signals, billing webhook coverage, and handoffization readiness before production handoffizability tooling.'
}
