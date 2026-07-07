import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const proofjournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProofjournalizabilityRolloutCheckStatus = z.infer<
  typeof proofjournalizabilityRolloutCheckStatusSchema
>

export const proofjournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: proofjournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProofjournalizabilityRolloutCheck = z.infer<typeof proofjournalizabilityRolloutCheckSchema>

export const proofjournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProofjournalizabilityRolloutStatus = z.infer<typeof proofjournalizabilityRolloutStatusSchema>

export const proofjournalizabilityCapabilitiesResponseSchema = z.object({
  supportsProofjournalizabilityRollout: z.literal(true),
  supportsProofjournalizabilityAdminTools: z.literal(true),
  supportsShieldScanProofjournalizabilitySignals: z.literal(true),
  supportsProviderCredentialProofjournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProofjournalizabilityCapabilitiesResponse = z.infer<
  typeof proofjournalizabilityCapabilitiesResponseSchema
>

export const proofjournalizabilityRolloutResponseSchema = z.object({
  status: proofjournalizabilityRolloutStatusSchema,
  checks: z.array(proofjournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProofjournalizabilityRolloutResponse = z.infer<
  typeof proofjournalizabilityRolloutResponseSchema
>

export function getProofjournalizabilityRolloutGuidance() {
  return 'Production proofjournalizability rollout validates shield scan proofjournalizability, provider credential proofjournalizability signals, billing webhook coverage, and reconciliationization readiness before production proofjournalizability tooling.'
}
