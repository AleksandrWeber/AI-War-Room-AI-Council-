import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const deallocationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DeallocationizabilityRolloutCheckStatus = z.infer<
  typeof deallocationizabilityRolloutCheckStatusSchema
>

export const deallocationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: deallocationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DeallocationizabilityRolloutCheck = z.infer<typeof deallocationizabilityRolloutCheckSchema>

export const deallocationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DeallocationizabilityRolloutStatus = z.infer<typeof deallocationizabilityRolloutStatusSchema>

export const deallocationizabilityCapabilitiesResponseSchema = z.object({
  supportsDeallocationizabilityRollout: z.literal(true),
  supportsDeallocationizabilityAdminTools: z.literal(true),
  supportsModelHealthDeallocationizabilitySignals: z.literal(true),
  supportsModelRegistryDeallocationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DeallocationizabilityCapabilitiesResponse = z.infer<
  typeof deallocationizabilityCapabilitiesResponseSchema
>

export const deallocationizabilityRolloutResponseSchema = z.object({
  status: deallocationizabilityRolloutStatusSchema,
  checks: z.array(deallocationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DeallocationizabilityRolloutResponse = z.infer<
  typeof deallocationizabilityRolloutResponseSchema
>

export function getDeallocationizabilityRolloutGuidance() {
  return 'Production deallocationizability rollout validates model health deallocationizability, model registry deallocationizability signals, billing record coverage, and optimization readiness before production deallocationizability tooling.'
}
