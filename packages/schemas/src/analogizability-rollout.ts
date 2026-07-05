import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const analogizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AnalogizabilityRolloutCheckStatus = z.infer<
  typeof analogizabilityRolloutCheckStatusSchema
>

export const analogizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: analogizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AnalogizabilityRolloutCheck = z.infer<typeof analogizabilityRolloutCheckSchema>

export const analogizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AnalogizabilityRolloutStatus = z.infer<typeof analogizabilityRolloutStatusSchema>

export const analogizabilityCapabilitiesResponseSchema = z.object({
  supportsAnalogizabilityRollout: z.literal(true),
  supportsAnalogizabilityAdminTools: z.literal(true),
  supportsUsageEventAnalogizabilitySignals: z.literal(true),
  supportsMeterUsageAnalogizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AnalogizabilityCapabilitiesResponse = z.infer<
  typeof analogizabilityCapabilitiesResponseSchema
>

export const analogizabilityRolloutResponseSchema = z.object({
  status: analogizabilityRolloutStatusSchema,
  checks: z.array(analogizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AnalogizabilityRolloutResponse = z.infer<
  typeof analogizabilityRolloutResponseSchema
>

export function getAnalogizabilityRolloutGuidance() {
  return 'Production analogizability rollout validates usage event analogizability, meter usage analogizability signals, workspace limit coverage, and analogization readiness before production analogizability tooling.'
}
