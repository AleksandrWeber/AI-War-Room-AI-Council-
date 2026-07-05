import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const integrityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type IntegrityRolloutCheckStatus = z.infer<
  typeof integrityRolloutCheckStatusSchema
>

export const integrityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: integrityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type IntegrityRolloutCheck = z.infer<typeof integrityRolloutCheckSchema>

export const integrityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type IntegrityRolloutStatus = z.infer<typeof integrityRolloutStatusSchema>

export const integrityCapabilitiesResponseSchema = z.object({
  supportsIntegrityRollout: z.literal(true),
  supportsIntegrityAdminTools: z.literal(true),
  supportsArtifactIntegritySignals: z.literal(true),
  supportsShieldScanIntegritySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type IntegrityCapabilitiesResponse = z.infer<
  typeof integrityCapabilitiesResponseSchema
>

export const integrityRolloutResponseSchema = z.object({
  status: integrityRolloutStatusSchema,
  checks: z.array(integrityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type IntegrityRolloutResponse = z.infer<
  typeof integrityRolloutResponseSchema
>

export function getIntegrityRolloutGuidance() {
  return 'Production integrity rollout validates artifact content integrity, shield scan coverage, run outcome signals, and verification readiness before production integrity tooling.'
}
