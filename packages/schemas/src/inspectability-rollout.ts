import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const inspectabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type InspectabilityRolloutCheckStatus = z.infer<
  typeof inspectabilityRolloutCheckStatusSchema
>

export const inspectabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: inspectabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type InspectabilityRolloutCheck = z.infer<typeof inspectabilityRolloutCheckSchema>

export const inspectabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type InspectabilityRolloutStatus = z.infer<typeof inspectabilityRolloutStatusSchema>

export const inspectabilityCapabilitiesResponseSchema = z.object({
  supportsInspectabilityRollout: z.literal(true),
  supportsInspectabilityAdminTools: z.literal(true),
  supportsUsageInspectabilitySignals: z.literal(true),
  supportsMeterUsageInspectabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type InspectabilityCapabilitiesResponse = z.infer<
  typeof inspectabilityCapabilitiesResponseSchema
>

export const inspectabilityRolloutResponseSchema = z.object({
  status: inspectabilityRolloutStatusSchema,
  checks: z.array(inspectabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type InspectabilityRolloutResponse = z.infer<
  typeof inspectabilityRolloutResponseSchema
>

export function getInspectabilityRolloutGuidance() {
  return 'Production inspectability rollout validates usage inspectability, meter usage inspectability signals, workspace limit coverage, and review readiness before production inspectability tooling.'
}
