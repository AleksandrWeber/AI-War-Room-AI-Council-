import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const lexicalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LexicalizabilityRolloutCheckStatus = z.infer<
  typeof lexicalizabilityRolloutCheckStatusSchema
>

export const lexicalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: lexicalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LexicalizabilityRolloutCheck = z.infer<typeof lexicalizabilityRolloutCheckSchema>

export const lexicalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LexicalizabilityRolloutStatus = z.infer<typeof lexicalizabilityRolloutStatusSchema>

export const lexicalizabilityCapabilitiesResponseSchema = z.object({
  supportsLexicalizabilityRollout: z.literal(true),
  supportsLexicalizabilityAdminTools: z.literal(true),
  supportsMembershipLexicalizabilitySignals: z.literal(true),
  supportsUsageEventLexicalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LexicalizabilityCapabilitiesResponse = z.infer<
  typeof lexicalizabilityCapabilitiesResponseSchema
>

export const lexicalizabilityRolloutResponseSchema = z.object({
  status: lexicalizabilityRolloutStatusSchema,
  checks: z.array(lexicalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LexicalizabilityRolloutResponse = z.infer<
  typeof lexicalizabilityRolloutResponseSchema
>

export function getLexicalizabilityRolloutGuidance() {
  return 'Production lexicalizability rollout validates membership lexicalizability, usage event lexicalizability signals, billing notification coverage, and lexicalization readiness before production lexicalizability tooling.'
}
