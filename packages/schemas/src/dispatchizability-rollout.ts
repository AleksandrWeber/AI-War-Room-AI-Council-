import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const dispatchizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DispatchizabilityRolloutCheckStatus = z.infer<
  typeof dispatchizabilityRolloutCheckStatusSchema
>

export const dispatchizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: dispatchizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DispatchizabilityRolloutCheck = z.infer<typeof dispatchizabilityRolloutCheckSchema>

export const dispatchizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DispatchizabilityRolloutStatus = z.infer<typeof dispatchizabilityRolloutStatusSchema>

export const dispatchizabilityCapabilitiesResponseSchema = z.object({
  supportsDispatchizabilityRollout: z.literal(true),
  supportsDispatchizabilityAdminTools: z.literal(true),
  supportsModelHealthDispatchizabilitySignals: z.literal(true),
  supportsModelRegistryDispatchizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DispatchizabilityCapabilitiesResponse = z.infer<
  typeof dispatchizabilityCapabilitiesResponseSchema
>

export const dispatchizabilityRolloutResponseSchema = z.object({
  status: dispatchizabilityRolloutStatusSchema,
  checks: z.array(dispatchizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DispatchizabilityRolloutResponse = z.infer<
  typeof dispatchizabilityRolloutResponseSchema
>

export function getDispatchizabilityRolloutGuidance() {
  return 'Production dispatchizability rollout validates model health dispatchizability, model registry dispatchizability signals, billing record coverage, and optimization readiness before production dispatchizability tooling.'
}
