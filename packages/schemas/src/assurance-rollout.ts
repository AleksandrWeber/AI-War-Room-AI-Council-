import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const assuranceRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AssuranceRolloutCheckStatus = z.infer<
  typeof assuranceRolloutCheckStatusSchema
>

export const assuranceRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: assuranceRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AssuranceRolloutCheck = z.infer<typeof assuranceRolloutCheckSchema>

export const assuranceRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AssuranceRolloutStatus = z.infer<
  typeof assuranceRolloutStatusSchema
>

export const assuranceCapabilitiesResponseSchema = z.object({
  supportsAssuranceRollout: z.literal(true),
  supportsAssuranceAdminTools: z.literal(true),
  supportsShieldQualityAssuranceSignals: z.literal(true),
  supportsArtifactQualityAssuranceSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AssuranceCapabilitiesResponse = z.infer<
  typeof assuranceCapabilitiesResponseSchema
>

export const assuranceRolloutResponseSchema = z.object({
  status: assuranceRolloutStatusSchema,
  checks: z.array(assuranceRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AssuranceRolloutResponse = z.infer<
  typeof assuranceRolloutResponseSchema
>

export function getAssuranceRolloutGuidance() {
  return 'Production assurance rollout validates shield quality assurance, artifact quality coverage, run outcome signals, and quality readiness before production assurance tooling.'
}
