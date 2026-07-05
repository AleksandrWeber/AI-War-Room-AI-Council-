import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const versionizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type VersionizabilityRolloutCheckStatus = z.infer<
  typeof versionizabilityRolloutCheckStatusSchema
>

export const versionizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: versionizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type VersionizabilityRolloutCheck = z.infer<typeof versionizabilityRolloutCheckSchema>

export const versionizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type VersionizabilityRolloutStatus = z.infer<typeof versionizabilityRolloutStatusSchema>

export const versionizabilityCapabilitiesResponseSchema = z.object({
  supportsVersionizabilityRollout: z.literal(true),
  supportsVersionizabilityAdminTools: z.literal(true),
  supportsMeterUsageVersionizabilitySignals: z.literal(true),
  supportsUsageEventVersionizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type VersionizabilityCapabilitiesResponse = z.infer<
  typeof versionizabilityCapabilitiesResponseSchema
>

export const versionizabilityRolloutResponseSchema = z.object({
  status: versionizabilityRolloutStatusSchema,
  checks: z.array(versionizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type VersionizabilityRolloutResponse = z.infer<
  typeof versionizabilityRolloutResponseSchema
>

export function getVersionizabilityRolloutGuidance() {
  return 'Production versionizability rollout validates meter usage versionizability, usage event versionizability signals, workspace limit coverage, and versionization readiness before production versionizability tooling.'
}
