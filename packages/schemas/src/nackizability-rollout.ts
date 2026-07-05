import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const nackizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NackizabilityRolloutCheckStatus = z.infer<
  typeof nackizabilityRolloutCheckStatusSchema
>

export const nackizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: nackizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NackizabilityRolloutCheck = z.infer<typeof nackizabilityRolloutCheckSchema>

export const nackizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NackizabilityRolloutStatus = z.infer<typeof nackizabilityRolloutStatusSchema>

export const nackizabilityCapabilitiesResponseSchema = z.object({
  supportsNackizabilityRollout: z.literal(true),
  supportsNackizabilityAdminTools: z.literal(true),
  supportsMeterUsageNackizabilitySignals: z.literal(true),
  supportsUsageEventNackizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NackizabilityCapabilitiesResponse = z.infer<
  typeof nackizabilityCapabilitiesResponseSchema
>

export const nackizabilityRolloutResponseSchema = z.object({
  status: nackizabilityRolloutStatusSchema,
  checks: z.array(nackizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NackizabilityRolloutResponse = z.infer<
  typeof nackizabilityRolloutResponseSchema
>

export function getNackizabilityRolloutGuidance() {
  return 'Production nackizability rollout validates meter usage nackizability, usage event nackizability signals, workspace limit coverage, and nackization readiness before production nackizability tooling.'
}
