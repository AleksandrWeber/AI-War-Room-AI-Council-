import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const tracejournalizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TracejournalizabilityRolloutCheckStatus = z.infer<
  typeof tracejournalizabilityRolloutCheckStatusSchema
>

export const tracejournalizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: tracejournalizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TracejournalizabilityRolloutCheck = z.infer<typeof tracejournalizabilityRolloutCheckSchema>

export const tracejournalizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TracejournalizabilityRolloutStatus = z.infer<typeof tracejournalizabilityRolloutStatusSchema>

export const tracejournalizabilityCapabilitiesResponseSchema = z.object({
  supportsTracejournalizabilityRollout: z.literal(true),
  supportsTracejournalizabilityAdminTools: z.literal(true),
  supportsMembershipTracejournalizabilitySignals: z.literal(true),
  supportsUsageEventTracejournalizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TracejournalizabilityCapabilitiesResponse = z.infer<
  typeof tracejournalizabilityCapabilitiesResponseSchema
>

export const tracejournalizabilityRolloutResponseSchema = z.object({
  status: tracejournalizabilityRolloutStatusSchema,
  checks: z.array(tracejournalizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TracejournalizabilityRolloutResponse = z.infer<
  typeof tracejournalizabilityRolloutResponseSchema
>

export function getTracejournalizabilityRolloutGuidance() {
  return 'Production tracejournalizability rollout validates membership tracejournalizability, usage event tracejournalizability signals, billing notification coverage, and healingization readiness before production tracejournalizability tooling.'
}
