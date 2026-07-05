import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const generalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type GeneralizabilityRolloutCheckStatus = z.infer<
  typeof generalizabilityRolloutCheckStatusSchema
>

export const generalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: generalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type GeneralizabilityRolloutCheck = z.infer<typeof generalizabilityRolloutCheckSchema>

export const generalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type GeneralizabilityRolloutStatus = z.infer<typeof generalizabilityRolloutStatusSchema>

export const generalizabilityCapabilitiesResponseSchema = z.object({
  supportsGeneralizabilityRollout: z.literal(true),
  supportsGeneralizabilityAdminTools: z.literal(true),
  supportsMeterUsageGeneralizabilitySignals: z.literal(true),
  supportsUsageEventGeneralizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type GeneralizabilityCapabilitiesResponse = z.infer<
  typeof generalizabilityCapabilitiesResponseSchema
>

export const generalizabilityRolloutResponseSchema = z.object({
  status: generalizabilityRolloutStatusSchema,
  checks: z.array(generalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type GeneralizabilityRolloutResponse = z.infer<
  typeof generalizabilityRolloutResponseSchema
>

export function getGeneralizabilityRolloutGuidance() {
  return 'Production generalizability rollout validates meter usage generalizability, usage event generalizability signals, workspace limit coverage, and generalization readiness before production generalizability tooling.'
}
