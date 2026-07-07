import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const accountabilityizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AccountabilityizabilityRolloutCheckStatus = z.infer<
  typeof accountabilityizabilityRolloutCheckStatusSchema
>

export const accountabilityizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: accountabilityizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AccountabilityizabilityRolloutCheck = z.infer<typeof accountabilityizabilityRolloutCheckSchema>

export const accountabilityizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AccountabilityizabilityRolloutStatus = z.infer<typeof accountabilityizabilityRolloutStatusSchema>

export const accountabilityizabilityCapabilitiesResponseSchema = z.object({
  supportsAccountabilityizabilityRollout: z.literal(true),
  supportsAccountabilityizabilityAdminTools: z.literal(true),
  supportsMembershipAccountabilityizabilitySignals: z.literal(true),
  supportsUsageEventAccountabilityizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AccountabilityizabilityCapabilitiesResponse = z.infer<
  typeof accountabilityizabilityCapabilitiesResponseSchema
>

export const accountabilityizabilityRolloutResponseSchema = z.object({
  status: accountabilityizabilityRolloutStatusSchema,
  checks: z.array(accountabilityizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AccountabilityizabilityRolloutResponse = z.infer<
  typeof accountabilityizabilityRolloutResponseSchema
>

export function getAccountabilityizabilityRolloutGuidance() {
  return 'Production accountabilityizability rollout validates membership accountabilityizability, usage event accountabilityizability signals, billing notification coverage, and healingization readiness before production accountabilityizability tooling.'
}
