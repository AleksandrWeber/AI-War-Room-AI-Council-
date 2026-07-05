import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const responsivenessRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ResponsivenessRolloutCheckStatus = z.infer<
  typeof responsivenessRolloutCheckStatusSchema
>

export const responsivenessRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: responsivenessRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ResponsivenessRolloutCheck = z.infer<typeof responsivenessRolloutCheckSchema>

export const responsivenessRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ResponsivenessRolloutStatus = z.infer<typeof responsivenessRolloutStatusSchema>

export const responsivenessCapabilitiesResponseSchema = z.object({
  supportsResponsivenessRollout: z.literal(true),
  supportsResponsivenessAdminTools: z.literal(true),
  supportsUsageEventResponsivenessSignals: z.literal(true),
  supportsMeterUsageResponsivenessSignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ResponsivenessCapabilitiesResponse = z.infer<
  typeof responsivenessCapabilitiesResponseSchema
>

export const responsivenessRolloutResponseSchema = z.object({
  status: responsivenessRolloutStatusSchema,
  checks: z.array(responsivenessRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ResponsivenessRolloutResponse = z.infer<
  typeof responsivenessRolloutResponseSchema
>

export function getResponsivenessRolloutGuidance() {
  return 'Production responsiveness rollout validates usage event responsiveness, meter usage responsiveness signals, workspace limit coverage, and response readiness before production responsiveness tooling.'
}
