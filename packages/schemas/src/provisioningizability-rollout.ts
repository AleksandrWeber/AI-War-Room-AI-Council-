import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const provisioningizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ProvisioningizabilityRolloutCheckStatus = z.infer<
  typeof provisioningizabilityRolloutCheckStatusSchema
>

export const provisioningizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: provisioningizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ProvisioningizabilityRolloutCheck = z.infer<typeof provisioningizabilityRolloutCheckSchema>

export const provisioningizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ProvisioningizabilityRolloutStatus = z.infer<typeof provisioningizabilityRolloutStatusSchema>

export const provisioningizabilityCapabilitiesResponseSchema = z.object({
  supportsProvisioningizabilityRollout: z.literal(true),
  supportsProvisioningizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitProvisioningizabilitySignals: z.literal(true),
  supportsUsageEventProvisioningizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ProvisioningizabilityCapabilitiesResponse = z.infer<
  typeof provisioningizabilityCapabilitiesResponseSchema
>

export const provisioningizabilityRolloutResponseSchema = z.object({
  status: provisioningizabilityRolloutStatusSchema,
  checks: z.array(provisioningizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ProvisioningizabilityRolloutResponse = z.infer<
  typeof provisioningizabilityRolloutResponseSchema
>

export function getProvisioningizabilityRolloutGuidance() {
  return 'Production provisioningizability rollout validates workspace limit provisioningizability, usage event provisioningizability signals, billing record coverage, and provisioningization readiness before production provisioningizability tooling.'
}
