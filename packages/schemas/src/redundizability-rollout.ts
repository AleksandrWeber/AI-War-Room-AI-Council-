import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const redundizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RedundizabilityRolloutCheckStatus = z.infer<
  typeof redundizabilityRolloutCheckStatusSchema
>

export const redundizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: redundizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RedundizabilityRolloutCheck = z.infer<typeof redundizabilityRolloutCheckSchema>

export const redundizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RedundizabilityRolloutStatus = z.infer<typeof redundizabilityRolloutStatusSchema>

export const redundizabilityCapabilitiesResponseSchema = z.object({
  supportsRedundizabilityRollout: z.literal(true),
  supportsRedundizabilityAdminTools: z.literal(true),
  supportsMeterUsageRedundizabilitySignals: z.literal(true),
  supportsUsageEventRedundizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type RedundizabilityCapabilitiesResponse = z.infer<
  typeof redundizabilityCapabilitiesResponseSchema
>

export const redundizabilityRolloutResponseSchema = z.object({
  status: redundizabilityRolloutStatusSchema,
  checks: z.array(redundizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RedundizabilityRolloutResponse = z.infer<
  typeof redundizabilityRolloutResponseSchema
>

export function getRedundizabilityRolloutGuidance() {
  return 'Production redundizability rollout validates meter usage redundizability, usage event redundizability signals, workspace limit coverage, and redundization readiness before production redundizability tooling.'
}
