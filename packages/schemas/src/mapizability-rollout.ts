import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const mapizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MapizabilityRolloutCheckStatus = z.infer<
  typeof mapizabilityRolloutCheckStatusSchema
>

export const mapizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: mapizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MapizabilityRolloutCheck = z.infer<typeof mapizabilityRolloutCheckSchema>

export const mapizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MapizabilityRolloutStatus = z.infer<typeof mapizabilityRolloutStatusSchema>

export const mapizabilityCapabilitiesResponseSchema = z.object({
  supportsMapizabilityRollout: z.literal(true),
  supportsMapizabilityAdminTools: z.literal(true),
  supportsMeterUsageMapizabilitySignals: z.literal(true),
  supportsUsageEventMapizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MapizabilityCapabilitiesResponse = z.infer<
  typeof mapizabilityCapabilitiesResponseSchema
>

export const mapizabilityRolloutResponseSchema = z.object({
  status: mapizabilityRolloutStatusSchema,
  checks: z.array(mapizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MapizabilityRolloutResponse = z.infer<
  typeof mapizabilityRolloutResponseSchema
>

export function getMapizabilityRolloutGuidance() {
  return 'Production mapizability rollout validates meter usage mapizability, usage event mapizability signals, workspace limit coverage, and mapization readiness before production mapizability tooling.'
}
