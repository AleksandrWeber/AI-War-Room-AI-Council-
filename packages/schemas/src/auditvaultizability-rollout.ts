import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const auditvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AuditvaultizabilityRolloutCheckStatus = z.infer<
  typeof auditvaultizabilityRolloutCheckStatusSchema
>

export const auditvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: auditvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AuditvaultizabilityRolloutCheck = z.infer<typeof auditvaultizabilityRolloutCheckSchema>

export const auditvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AuditvaultizabilityRolloutStatus = z.infer<typeof auditvaultizabilityRolloutStatusSchema>

export const auditvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsAuditvaultizabilityRollout: z.literal(true),
  supportsAuditvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanAuditvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialAuditvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AuditvaultizabilityCapabilitiesResponse = z.infer<
  typeof auditvaultizabilityCapabilitiesResponseSchema
>

export const auditvaultizabilityRolloutResponseSchema = z.object({
  status: auditvaultizabilityRolloutStatusSchema,
  checks: z.array(auditvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AuditvaultizabilityRolloutResponse = z.infer<
  typeof auditvaultizabilityRolloutResponseSchema
>

export function getAuditvaultizabilityRolloutGuidance() {
  return 'Production auditvaultizability rollout validates shield scan auditvaultizability, provider credential auditvaultizability signals, billing webhook coverage, and reconciliationization readiness before production auditvaultizability tooling.'
}
