import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const orchestrizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OrchestrizabilityRolloutCheckStatus = z.infer<
  typeof orchestrizabilityRolloutCheckStatusSchema
>

export const orchestrizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: orchestrizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OrchestrizabilityRolloutCheck = z.infer<typeof orchestrizabilityRolloutCheckSchema>

export const orchestrizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OrchestrizabilityRolloutStatus = z.infer<typeof orchestrizabilityRolloutStatusSchema>

export const orchestrizabilityCapabilitiesResponseSchema = z.object({
  supportsOrchestrizabilityRollout: z.literal(true),
  supportsOrchestrizabilityAdminTools: z.literal(true),
  supportsMembershipOrchestrizabilitySignals: z.literal(true),
  supportsUsageEventOrchestrizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OrchestrizabilityCapabilitiesResponse = z.infer<
  typeof orchestrizabilityCapabilitiesResponseSchema
>

export const orchestrizabilityRolloutResponseSchema = z.object({
  status: orchestrizabilityRolloutStatusSchema,
  checks: z.array(orchestrizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OrchestrizabilityRolloutResponse = z.infer<
  typeof orchestrizabilityRolloutResponseSchema
>

export function getOrchestrizabilityRolloutGuidance() {
  return 'Production orchestrizability rollout validates membership orchestrizability, usage event orchestrizability signals, billing notification coverage, and orchestrization readiness before production orchestrizability tooling.'
}
