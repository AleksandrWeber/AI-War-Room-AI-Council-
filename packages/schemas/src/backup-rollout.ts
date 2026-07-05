import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const backupRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BackupRolloutCheckStatus = z.infer<
  typeof backupRolloutCheckStatusSchema
>

export const backupRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: backupRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BackupRolloutCheck = z.infer<typeof backupRolloutCheckSchema>

export const backupRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BackupRolloutStatus = z.infer<typeof backupRolloutStatusSchema>

export const backupCapabilitiesResponseSchema = z.object({
  supportsBackupRollout: z.literal(true),
  supportsBackupAdminTools: z.literal(true),
  supportsPostgresBackupCoverage: z.literal(true),
  supportsRedisPersistenceChecks: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BackupCapabilitiesResponse = z.infer<
  typeof backupCapabilitiesResponseSchema
>

export const backupRolloutResponseSchema = z.object({
  status: backupRolloutStatusSchema,
  checks: z.array(backupRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BackupRolloutResponse = z.infer<typeof backupRolloutResponseSchema>

export function getBackupRolloutGuidance() {
  return 'Production backup rollout validates PostgreSQL and Redis persistence, critical table coverage, and migration prerequisites before restore-ready operations.'
}
