import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const backupizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type BackupizabilityRolloutCheckStatus = z.infer<
  typeof backupizabilityRolloutCheckStatusSchema
>

export const backupizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: backupizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type BackupizabilityRolloutCheck = z.infer<typeof backupizabilityRolloutCheckSchema>

export const backupizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type BackupizabilityRolloutStatus = z.infer<typeof backupizabilityRolloutStatusSchema>

export const backupizabilityCapabilitiesResponseSchema = z.object({
  supportsBackupizabilityRollout: z.literal(true),
  supportsBackupizabilityAdminTools: z.literal(true),
  supportsMeterUsageBackupizabilitySignals: z.literal(true),
  supportsUsageEventBackupizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type BackupizabilityCapabilitiesResponse = z.infer<
  typeof backupizabilityCapabilitiesResponseSchema
>

export const backupizabilityRolloutResponseSchema = z.object({
  status: backupizabilityRolloutStatusSchema,
  checks: z.array(backupizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type BackupizabilityRolloutResponse = z.infer<
  typeof backupizabilityRolloutResponseSchema
>

export function getBackupizabilityRolloutGuidance() {
  return 'Production backupizability rollout validates meter usage backupizability, usage event backupizability signals, workspace limit coverage, and backupization readiness before production backupizability tooling.'
}
