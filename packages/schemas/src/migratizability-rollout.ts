import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const migratizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MigratizabilityRolloutCheckStatus = z.infer<
  typeof migratizabilityRolloutCheckStatusSchema
>

export const migratizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: migratizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MigratizabilityRolloutCheck = z.infer<typeof migratizabilityRolloutCheckSchema>

export const migratizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MigratizabilityRolloutStatus = z.infer<typeof migratizabilityRolloutStatusSchema>

export const migratizabilityCapabilitiesResponseSchema = z.object({
  supportsMigratizabilityRollout: z.literal(true),
  supportsMigratizabilityAdminTools: z.literal(true),
  supportsWorkspaceLimitMigratizabilitySignals: z.literal(true),
  supportsUsageEventMigratizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MigratizabilityCapabilitiesResponse = z.infer<
  typeof migratizabilityCapabilitiesResponseSchema
>

export const migratizabilityRolloutResponseSchema = z.object({
  status: migratizabilityRolloutStatusSchema,
  checks: z.array(migratizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MigratizabilityRolloutResponse = z.infer<
  typeof migratizabilityRolloutResponseSchema
>

export function getMigratizabilityRolloutGuidance() {
  return 'Production migratizability rollout validates workspace limit migratizability, usage event migratizability signals, billing record coverage, and migratization readiness before production migratizability tooling.'
}
