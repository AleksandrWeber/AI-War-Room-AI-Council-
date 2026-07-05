import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const typifiabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TypifiabilityRolloutCheckStatus = z.infer<
  typeof typifiabilityRolloutCheckStatusSchema
>

export const typifiabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: typifiabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TypifiabilityRolloutCheck = z.infer<typeof typifiabilityRolloutCheckSchema>

export const typifiabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TypifiabilityRolloutStatus = z.infer<typeof typifiabilityRolloutStatusSchema>

export const typifiabilityCapabilitiesResponseSchema = z.object({
  supportsTypifiabilityRollout: z.literal(true),
  supportsTypifiabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitTypifiabilitySignals: z.literal(true),
  supportsUsageEventTypifiabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TypifiabilityCapabilitiesResponse = z.infer<
  typeof typifiabilityCapabilitiesResponseSchema
>

export const typifiabilityRolloutResponseSchema = z.object({
  status: typifiabilityRolloutStatusSchema,
  checks: z.array(typifiabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TypifiabilityRolloutResponse = z.infer<
  typeof typifiabilityRolloutResponseSchema
>

export function getTypifiabilityRolloutGuidance() {
  return 'Production typifiability rollout validates workspace limit typifiability, usage event typifiability signals, billing record coverage, and typification readiness before production typifiability tooling.'
}
