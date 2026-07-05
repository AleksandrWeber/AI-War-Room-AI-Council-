import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const semiotizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type SemiotizabilityAdminDomain = z.infer<typeof semiotizabilityAdminDomainSchema>

export const semiotizabilityAdminRecordSchema = z.object({
  domain: semiotizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SemiotizabilityAdminRecord = z.infer<typeof semiotizabilityAdminRecordSchema>

export const semiotizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  semiotizabilityPercent: z.number().min(0).max(100),
})
export type SemiotizabilityAdminStats = z.infer<typeof semiotizabilityAdminStatsSchema>

export const semiotizabilityAdminActionSchema = z.enum(['refresh_semiotizability_summary'])
export type SemiotizabilityAdminAction = z.infer<typeof semiotizabilityAdminActionSchema>

export const semiotizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(semiotizabilityAdminRecordSchema),
  stats: semiotizabilityAdminStatsSchema,
  availableActions: z.array(semiotizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SemiotizabilityAdminSummaryResponse = z.infer<
  typeof semiotizabilityAdminSummaryResponseSchema
>

export const semiotizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: semiotizabilityAdminActionSchema,
})
export type SemiotizabilityAdminActionRequest = z.infer<
  typeof semiotizabilityAdminActionRequestSchema
>

export const semiotizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: semiotizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: semiotizabilityAdminStatsSchema.optional(),
})
export type SemiotizabilityAdminActionResponse = z.infer<
  typeof semiotizabilityAdminActionResponseSchema
>
