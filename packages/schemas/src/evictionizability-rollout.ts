import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const evictionizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type EvictionizabilityRolloutCheckStatus = z.infer<
  typeof evictionizabilityRolloutCheckStatusSchema
>

export const evictionizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: evictionizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type EvictionizabilityRolloutCheck = z.infer<typeof evictionizabilityRolloutCheckSchema>

export const evictionizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type EvictionizabilityRolloutStatus = z.infer<typeof evictionizabilityRolloutStatusSchema>

export const evictionizabilityCapabilitiesResponseSchema = z.object({
  supportsEvictionizabilityRollout: z.literal(true),
  supportsEvictionizabilityAdminTools: z.literal(true),
  supportsMembershipEvictionizabilitySignals: z.literal(true),
  supportsUsageEventEvictionizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type EvictionizabilityCapabilitiesResponse = z.infer<
  typeof evictionizabilityCapabilitiesResponseSchema
>

export const evictionizabilityRolloutResponseSchema = z.object({
  status: evictionizabilityRolloutStatusSchema,
  checks: z.array(evictionizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type EvictionizabilityRolloutResponse = z.infer<
  typeof evictionizabilityRolloutResponseSchema
>

export function getEvictionizabilityRolloutGuidance() {
  return 'Production evictionizability rollout validates membership evictionizability, usage event evictionizability signals, billing notification coverage, and evictionization readiness before production evictionizability tooling.'
}
