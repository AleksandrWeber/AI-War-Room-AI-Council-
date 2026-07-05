import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const morphizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MorphizabilityRolloutCheckStatus = z.infer<
  typeof morphizabilityRolloutCheckStatusSchema
>

export const morphizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: morphizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MorphizabilityRolloutCheck = z.infer<typeof morphizabilityRolloutCheckSchema>

export const morphizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MorphizabilityRolloutStatus = z.infer<typeof morphizabilityRolloutStatusSchema>

export const morphizabilityCapabilitiesResponseSchema = z.object({
  supportsMorphizabilityRollout: z.literal(true),
  supportsMorphizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitMorphizabilitySignals: z.literal(true),
  supportsUsageEventMorphizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MorphizabilityCapabilitiesResponse = z.infer<
  typeof morphizabilityCapabilitiesResponseSchema
>

export const morphizabilityRolloutResponseSchema = z.object({
  status: morphizabilityRolloutStatusSchema,
  checks: z.array(morphizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MorphizabilityRolloutResponse = z.infer<
  typeof morphizabilityRolloutResponseSchema
>

export function getMorphizabilityRolloutGuidance() {
  return 'Production morphizability rollout validates workspace limit morphizability, usage event morphizability signals, billing record coverage, and morphization readiness before production morphizability tooling.'
}
