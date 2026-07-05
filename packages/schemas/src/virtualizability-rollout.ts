import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const virtualizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type VirtualizabilityRolloutCheckStatus = z.infer<
  typeof virtualizabilityRolloutCheckStatusSchema
>

export const virtualizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: virtualizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type VirtualizabilityRolloutCheck = z.infer<typeof virtualizabilityRolloutCheckSchema>

export const virtualizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type VirtualizabilityRolloutStatus = z.infer<typeof virtualizabilityRolloutStatusSchema>

export const virtualizabilityCapabilitiesResponseSchema = z.object({
  supportsVirtualizabilityRollout: z.literal(true),
  supportsVirtualizabilityAdminTools: z.literal(true),
  supportsBillingWebhookVirtualizabilitySignals: z.literal(true),
  supportsBillingRecordVirtualizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type VirtualizabilityCapabilitiesResponse = z.infer<
  typeof virtualizabilityCapabilitiesResponseSchema
>

export const virtualizabilityRolloutResponseSchema = z.object({
  status: virtualizabilityRolloutStatusSchema,
  checks: z.array(virtualizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type VirtualizabilityRolloutResponse = z.infer<
  typeof virtualizabilityRolloutResponseSchema
>

export function getVirtualizabilityRolloutGuidance() {
  return 'Production virtualizability rollout validates billing webhook virtualizability, billing record virtualizability signals, usage event coverage, and interpolation readiness before production virtualizability tooling.'
}
