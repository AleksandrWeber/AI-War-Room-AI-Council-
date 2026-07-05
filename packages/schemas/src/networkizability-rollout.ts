import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const networkizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type NetworkizabilityRolloutCheckStatus = z.infer<
  typeof networkizabilityRolloutCheckStatusSchema
>

export const networkizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: networkizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type NetworkizabilityRolloutCheck = z.infer<typeof networkizabilityRolloutCheckSchema>

export const networkizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type NetworkizabilityRolloutStatus = z.infer<typeof networkizabilityRolloutStatusSchema>

export const networkizabilityCapabilitiesResponseSchema = z.object({
  supportsNetworkizabilityRollout: z.literal(true),
  supportsNetworkizabilityAdminTools: z.literal(true),
  supportsMeterUsageNetworkizabilitySignals: z.literal(true),
  supportsUsageEventNetworkizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type NetworkizabilityCapabilitiesResponse = z.infer<
  typeof networkizabilityCapabilitiesResponseSchema
>

export const networkizabilityRolloutResponseSchema = z.object({
  status: networkizabilityRolloutStatusSchema,
  checks: z.array(networkizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type NetworkizabilityRolloutResponse = z.infer<
  typeof networkizabilityRolloutResponseSchema
>

export function getNetworkizabilityRolloutGuidance() {
  return 'Production networkizability rollout validates meter usage networkizability, usage event networkizability signals, workspace limit coverage, and networkization readiness before production networkizability tooling.'
}
