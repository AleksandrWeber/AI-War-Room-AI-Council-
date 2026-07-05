import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const compactizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type CompactizabilityRolloutCheckStatus = z.infer<
  typeof compactizabilityRolloutCheckStatusSchema
>

export const compactizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: compactizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type CompactizabilityRolloutCheck = z.infer<typeof compactizabilityRolloutCheckSchema>

export const compactizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type CompactizabilityRolloutStatus = z.infer<typeof compactizabilityRolloutStatusSchema>

export const compactizabilityCapabilitiesResponseSchema = z.object({
  supportsCompactizabilityRollout: z.literal(true),
  supportsCompactizabilityAdminTools: z.literal(true),
  supportsMembershipCompactizabilitySignals: z.literal(true),
  supportsUsageEventCompactizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type CompactizabilityCapabilitiesResponse = z.infer<
  typeof compactizabilityCapabilitiesResponseSchema
>

export const compactizabilityRolloutResponseSchema = z.object({
  status: compactizabilityRolloutStatusSchema,
  checks: z.array(compactizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type CompactizabilityRolloutResponse = z.infer<
  typeof compactizabilityRolloutResponseSchema
>

export function getCompactizabilityRolloutGuidance() {
  return 'Production compactizability rollout validates membership compactizability, usage event compactizability signals, billing notification coverage, and compactization readiness before production compactizability tooling.'
}
