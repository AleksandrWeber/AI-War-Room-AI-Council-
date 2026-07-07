import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const notarledgerizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NotarledgerizabilityRolloutCheckStatus = z.infer<
  typeof notarledgerizabilityRolloutCheckStatusSchema
>

export const notarledgerizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: notarledgerizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NotarledgerizabilityRolloutCheck = z.infer<typeof notarledgerizabilityRolloutCheckSchema>

export const notarledgerizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NotarledgerizabilityRolloutStatus = z.infer<typeof notarledgerizabilityRolloutStatusSchema>

export const notarledgerizabilityCapabilitiesResponseSchema = z.object({
  supportsNotarledgerizabilityRollout: z.literal(true),
  supportsNotarledgerizabilityAdminTools: z.literal(true),
  supportsMembershipNotarledgerizabilitySignals: z.literal(true),
  supportsUsageEventNotarledgerizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NotarledgerizabilityCapabilitiesResponse = z.infer<
  typeof notarledgerizabilityCapabilitiesResponseSchema
>

export const notarledgerizabilityRolloutResponseSchema = z.object({
  status: notarledgerizabilityRolloutStatusSchema,
  checks: z.array(notarledgerizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NotarledgerizabilityRolloutResponse = z.infer<
  typeof notarledgerizabilityRolloutResponseSchema
>

export function getNotarledgerizabilityRolloutGuidance() {
  return 'Production notarledgerizability rollout validates membership notarledgerizability, usage event notarledgerizability signals, billing notification coverage, and healingization readiness before production notarledgerizability tooling.'
}
