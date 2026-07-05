import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const terminologizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type TerminologizabilityRolloutCheckStatus = z.infer<
  typeof terminologizabilityRolloutCheckStatusSchema
>

export const terminologizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: terminologizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type TerminologizabilityRolloutCheck = z.infer<typeof terminologizabilityRolloutCheckSchema>

export const terminologizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type TerminologizabilityRolloutStatus = z.infer<typeof terminologizabilityRolloutStatusSchema>

export const terminologizabilityCapabilitiesResponseSchema = z.object({
  supportsTerminologizabilityRollout: z.literal(true),
  supportsTerminologizabilityAdminTools: z.literal(true),
  supportsMembershipTerminologizabilitySignals: z.literal(true),
  supportsUsageEventTerminologizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type TerminologizabilityCapabilitiesResponse = z.infer<
  typeof terminologizabilityCapabilitiesResponseSchema
>

export const terminologizabilityRolloutResponseSchema = z.object({
  status: terminologizabilityRolloutStatusSchema,
  checks: z.array(terminologizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type TerminologizabilityRolloutResponse = z.infer<
  typeof terminologizabilityRolloutResponseSchema
>

export function getTerminologizabilityRolloutGuidance() {
  return 'Production terminologizability rollout validates membership terminologizability, usage event terminologizability signals, billing notification coverage, and terminologization readiness before production terminologizability tooling.'
}
