import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const allocationizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type AllocationizabilityRolloutCheckStatus = z.infer<
  typeof allocationizabilityRolloutCheckStatusSchema
>

export const allocationizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: allocationizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type AllocationizabilityRolloutCheck = z.infer<typeof allocationizabilityRolloutCheckSchema>

export const allocationizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type AllocationizabilityRolloutStatus = z.infer<typeof allocationizabilityRolloutStatusSchema>

export const allocationizabilityCapabilitiesResponseSchema = z.object({
  supportsAllocationizabilityRollout: z.literal(true),
  supportsAllocationizabilityAdminTools: z.literal(true),
  supportsProviderCredentialAllocationizabilitySignals: z.literal(true),
  supportsModelRegistryAllocationizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type AllocationizabilityCapabilitiesResponse = z.infer<
  typeof allocationizabilityCapabilitiesResponseSchema
>

export const allocationizabilityRolloutResponseSchema = z.object({
  status: allocationizabilityRolloutStatusSchema,
  checks: z.array(allocationizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type AllocationizabilityRolloutResponse = z.infer<
  typeof allocationizabilityRolloutResponseSchema
>

export function getAllocationizabilityRolloutGuidance() {
  return 'Production allocationizability rollout validates provider credential allocationizability, model registry allocationizability signals, billing webhook coverage, and allocationization readiness before production allocationizability tooling.'
}
