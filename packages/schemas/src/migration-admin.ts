import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const migrationAdminRecordSchema = z.object({
  version: nonEmptyStringSchema,
  status: z.enum(['applied', 'pending']),
  appliedAt: utcDateStringSchema.optional(),
})
export type MigrationAdminRecord = z.infer<typeof migrationAdminRecordSchema>

export const migrationAdminStatsSchema = z.object({
  totalMigrations: z.number().int().nonnegative(),
  appliedCount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  schemaMigrationsTableExists: z.boolean(),
})
export type MigrationAdminStats = z.infer<typeof migrationAdminStatsSchema>

export const migrationAdminActionSchema = z.enum(['refresh_migration_summary'])
export type MigrationAdminAction = z.infer<typeof migrationAdminActionSchema>

export const migrationAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(migrationAdminRecordSchema),
  stats: migrationAdminStatsSchema,
  availableActions: z.array(migrationAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MigrationAdminSummaryResponse = z.infer<
  typeof migrationAdminSummaryResponseSchema
>

export const migrationAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: migrationAdminActionSchema,
})
export type MigrationAdminActionRequest = z.infer<
  typeof migrationAdminActionRequestSchema
>

export const migrationAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: migrationAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: migrationAdminStatsSchema.optional(),
})
export type MigrationAdminActionResponse = z.infer<
  typeof migrationAdminActionResponseSchema
>

export type MigrationInventory = {
  availableVersions: string[]
  appliedVersions: Array<{ version: string; appliedAt: string }>
  pendingVersions: string[]
  schemaMigrationsTableExists: boolean
}
