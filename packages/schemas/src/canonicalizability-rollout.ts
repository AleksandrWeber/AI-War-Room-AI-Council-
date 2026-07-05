import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const canonicalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CanonicalizabilityRolloutCheckStatus = z.infer<
  typeof canonicalizabilityRolloutCheckStatusSchema
>

export const canonicalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: canonicalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CanonicalizabilityRolloutCheck = z.infer<typeof canonicalizabilityRolloutCheckSchema>

export const canonicalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CanonicalizabilityRolloutStatus = z.infer<typeof canonicalizabilityRolloutStatusSchema>

export const canonicalizabilityCapabilitiesResponseSchema = z.object({
  supportsCanonicalizabilityRollout: z.literal(true),
  supportsCanonicalizabilityAdminTools: z.literal(true),
  supportsModelHealthCanonicalizabilitySignals: z.literal(true),
  supportsModelRegistryCanonicalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CanonicalizabilityCapabilitiesResponse = z.infer<
  typeof canonicalizabilityCapabilitiesResponseSchema
>

export const canonicalizabilityRolloutResponseSchema = z.object({
  status: canonicalizabilityRolloutStatusSchema,
  checks: z.array(canonicalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CanonicalizabilityRolloutResponse = z.infer<
  typeof canonicalizabilityRolloutResponseSchema
>

export function getCanonicalizabilityRolloutGuidance() {
  return 'Production canonicalizability rollout validates model health canonicalizability, model registry canonicalizability signals, billing record coverage, and canonicalization readiness before production canonicalizability tooling.'
}
