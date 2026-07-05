import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const feasibilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type FeasibilityRolloutCheckStatus = z.infer<
  typeof feasibilityRolloutCheckStatusSchema
>

export const feasibilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: feasibilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type FeasibilityRolloutCheck = z.infer<typeof feasibilityRolloutCheckSchema>

export const feasibilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type FeasibilityRolloutStatus = z.infer<typeof feasibilityRolloutStatusSchema>

export const feasibilityCapabilitiesResponseSchema = z.object({
  supportsFeasibilityRollout: z.literal(true),
  supportsFeasibilityAdminTools: z.literal(true),
  supportsProviderCredentialFeasibilitySignals: z.literal(true),
  supportsUsageEventFeasibilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type FeasibilityCapabilitiesResponse = z.infer<
  typeof feasibilityCapabilitiesResponseSchema
>

export const feasibilityRolloutResponseSchema = z.object({
  status: feasibilityRolloutStatusSchema,
  checks: z.array(feasibilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type FeasibilityRolloutResponse = z.infer<
  typeof feasibilityRolloutResponseSchema
>

export function getFeasibilityRolloutGuidance() {
  return 'Production feasibility rollout validates provider credential feasibility, usage event feasibility signals, meter usage coverage, and feasibility readiness before production feasibility tooling.'
}
