import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const oversightizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OversightizabilityRolloutCheckStatus = z.infer<
  typeof oversightizabilityRolloutCheckStatusSchema
>

export const oversightizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: oversightizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OversightizabilityRolloutCheck = z.infer<typeof oversightizabilityRolloutCheckSchema>

export const oversightizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OversightizabilityRolloutStatus = z.infer<typeof oversightizabilityRolloutStatusSchema>

export const oversightizabilityCapabilitiesResponseSchema = z.object({
  supportsOversightizabilityRollout: z.literal(true),
  supportsOversightizabilityAdminTools: z.literal(true),
  supportsShieldScanOversightizabilitySignals: z.literal(true),
  supportsProviderCredentialOversightizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OversightizabilityCapabilitiesResponse = z.infer<
  typeof oversightizabilityCapabilitiesResponseSchema
>

export const oversightizabilityRolloutResponseSchema = z.object({
  status: oversightizabilityRolloutStatusSchema,
  checks: z.array(oversightizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OversightizabilityRolloutResponse = z.infer<
  typeof oversightizabilityRolloutResponseSchema
>

export function getOversightizabilityRolloutGuidance() {
  return 'Production oversightizability rollout validates shield scan oversightizability, provider credential oversightizability signals, billing webhook coverage, and reconciliationization readiness before production oversightizability tooling.'
}
