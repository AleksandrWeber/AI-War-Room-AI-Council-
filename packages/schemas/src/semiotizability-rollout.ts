import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const semiotizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SemiotizabilityRolloutCheckStatus = z.infer<
  typeof semiotizabilityRolloutCheckStatusSchema
>

export const semiotizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: semiotizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SemiotizabilityRolloutCheck = z.infer<typeof semiotizabilityRolloutCheckSchema>

export const semiotizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SemiotizabilityRolloutStatus = z.infer<typeof semiotizabilityRolloutStatusSchema>

export const semiotizabilityCapabilitiesResponseSchema = z.object({
  supportsSemiotizabilityRollout: z.literal(true),
  supportsSemiotizabilityAdminTools: z.literal(true),
  supportsShieldScanSemiotizabilitySignals: z.literal(true),
  supportsProviderCredentialSemiotizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SemiotizabilityCapabilitiesResponse = z.infer<
  typeof semiotizabilityCapabilitiesResponseSchema
>

export const semiotizabilityRolloutResponseSchema = z.object({
  status: semiotizabilityRolloutStatusSchema,
  checks: z.array(semiotizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SemiotizabilityRolloutResponse = z.infer<
  typeof semiotizabilityRolloutResponseSchema
>

export function getSemiotizabilityRolloutGuidance() {
  return 'Production semiotizability rollout validates shield scan semiotizability, provider credential semiotizability signals, billing webhook coverage, and semiotization readiness before production semiotizability tooling.'
}
