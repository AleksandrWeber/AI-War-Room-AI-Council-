import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const monitorizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MonitorizabilityRolloutCheckStatus = z.infer<
  typeof monitorizabilityRolloutCheckStatusSchema
>

export const monitorizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: monitorizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MonitorizabilityRolloutCheck = z.infer<typeof monitorizabilityRolloutCheckSchema>

export const monitorizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MonitorizabilityRolloutStatus = z.infer<typeof monitorizabilityRolloutStatusSchema>

export const monitorizabilityCapabilitiesResponseSchema = z.object({
  supportsMonitorizabilityRollout: z.literal(true),
  supportsMonitorizabilityAdminTools: z.literal(true),
  supportsMembershipMonitorizabilitySignals: z.literal(true),
  supportsUsageEventMonitorizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MonitorizabilityCapabilitiesResponse = z.infer<
  typeof monitorizabilityCapabilitiesResponseSchema
>

export const monitorizabilityRolloutResponseSchema = z.object({
  status: monitorizabilityRolloutStatusSchema,
  checks: z.array(monitorizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MonitorizabilityRolloutResponse = z.infer<
  typeof monitorizabilityRolloutResponseSchema
>

export function getMonitorizabilityRolloutGuidance() {
  return 'Production monitorizability rollout validates membership monitorizability, usage event monitorizability signals, billing notification coverage, and monitorization readiness before production monitorizability tooling.'
}
