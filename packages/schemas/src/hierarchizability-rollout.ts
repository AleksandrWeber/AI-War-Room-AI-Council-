import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const hierarchizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type HierarchizabilityRolloutCheckStatus = z.infer<
  typeof hierarchizabilityRolloutCheckStatusSchema
>

export const hierarchizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: hierarchizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type HierarchizabilityRolloutCheck = z.infer<typeof hierarchizabilityRolloutCheckSchema>

export const hierarchizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type HierarchizabilityRolloutStatus = z.infer<typeof hierarchizabilityRolloutStatusSchema>

export const hierarchizabilityCapabilitiesResponseSchema = z.object({
  supportsHierarchizabilityRollout: z.literal(true),
  supportsHierarchizabilityAdminTools: z.literal(true),
  supportsMeterUsageHierarchizabilitySignals: z.literal(true),
  supportsUsageEventHierarchizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type HierarchizabilityCapabilitiesResponse = z.infer<
  typeof hierarchizabilityCapabilitiesResponseSchema
>

export const hierarchizabilityRolloutResponseSchema = z.object({
  status: hierarchizabilityRolloutStatusSchema,
  checks: z.array(hierarchizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type HierarchizabilityRolloutResponse = z.infer<
  typeof hierarchizabilityRolloutResponseSchema
>

export function getHierarchizabilityRolloutGuidance() {
  return 'Production hierarchizability rollout validates meter usage hierarchizability, usage event hierarchizability signals, workspace limit coverage, and hierarchization readiness before production hierarchizability tooling.'
}
