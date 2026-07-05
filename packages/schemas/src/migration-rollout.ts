import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const migrationRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MigrationRolloutCheckStatus = z.infer<
  typeof migrationRolloutCheckStatusSchema
>

export const migrationRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: migrationRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MigrationRolloutCheck = z.infer<typeof migrationRolloutCheckSchema>

export const migrationRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MigrationRolloutStatus = z.infer<typeof migrationRolloutStatusSchema>

export const migrationCapabilitiesResponseSchema = z.object({
  supportsMigrationRollout: z.literal(true),
  supportsMigrationAdminTools: z.literal(true),
  supportsSchemaMigrationsTable: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MigrationCapabilitiesResponse = z.infer<
  typeof migrationCapabilitiesResponseSchema
>

export const migrationRolloutResponseSchema = z.object({
  status: migrationRolloutStatusSchema,
  checks: z.array(migrationRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MigrationRolloutResponse = z.infer<
  typeof migrationRolloutResponseSchema
>

export function getMigrationRolloutGuidance() {
  return 'Database migration rollout validates schema migration inventory, applied migration coverage, and PostgreSQL persistence before production migration tooling.'
}
