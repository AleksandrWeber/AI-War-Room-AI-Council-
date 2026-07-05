import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const illustratabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type IllustratabilityAdminDomain = z.infer<typeof illustratabilityAdminDomainSchema>

export const illustratabilityAdminRecordSchema = z.object({
  domain: illustratabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IllustratabilityAdminRecord = z.infer<typeof illustratabilityAdminRecordSchema>

export const illustratabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  illustratabilityPercent: z.number().min(0).max(100),
})
export type IllustratabilityAdminStats = z.infer<typeof illustratabilityAdminStatsSchema>

export const illustratabilityAdminActionSchema = z.enum(['refresh_illustratability_summary'])
export type IllustratabilityAdminAction = z.infer<typeof illustratabilityAdminActionSchema>

export const illustratabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(illustratabilityAdminRecordSchema),
  stats: illustratabilityAdminStatsSchema,
  availableActions: z.array(illustratabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IllustratabilityAdminSummaryResponse = z.infer<
  typeof illustratabilityAdminSummaryResponseSchema
>

export const illustratabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: illustratabilityAdminActionSchema,
})
export type IllustratabilityAdminActionRequest = z.infer<
  typeof illustratabilityAdminActionRequestSchema
>

export const illustratabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: illustratabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: illustratabilityAdminStatsSchema.optional(),
})
export type IllustratabilityAdminActionResponse = z.infer<
  typeof illustratabilityAdminActionResponseSchema
>
