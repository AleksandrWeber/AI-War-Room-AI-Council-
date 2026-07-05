import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const conspicuousnessRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ConspicuousnessRolloutCheckStatus = z.infer<
  typeof conspicuousnessRolloutCheckStatusSchema
>

export const conspicuousnessRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: conspicuousnessRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ConspicuousnessRolloutCheck = z.infer<typeof conspicuousnessRolloutCheckSchema>

export const conspicuousnessRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ConspicuousnessRolloutStatus = z.infer<typeof conspicuousnessRolloutStatusSchema>

export const conspicuousnessCapabilitiesResponseSchema = z.object({
  supportsConspicuousnessRollout: z.literal(true),
  supportsConspicuousnessAdminTools: z.literal(true),
  supportsMembershipConspicuousnessSignals: z.literal(true),
  supportsUsageEventConspicuousnessSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ConspicuousnessCapabilitiesResponse = z.infer<
  typeof conspicuousnessCapabilitiesResponseSchema
>

export const conspicuousnessRolloutResponseSchema = z.object({
  status: conspicuousnessRolloutStatusSchema,
  checks: z.array(conspicuousnessRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ConspicuousnessRolloutResponse = z.infer<
  typeof conspicuousnessRolloutResponseSchema
>

export function getConspicuousnessRolloutGuidance() {
  return 'Production conspicuousness rollout validates membership conspicuousness, usage event conspicuousness signals, billing notification coverage, and conspicuousness readiness before production conspicuousness tooling.'
}
