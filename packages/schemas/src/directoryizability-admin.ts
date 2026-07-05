import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const directoryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type DirectoryizabilityAdminDomain = z.infer<typeof directoryizabilityAdminDomainSchema>

export const directoryizabilityAdminRecordSchema = z.object({
  domain: directoryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DirectoryizabilityAdminRecord = z.infer<typeof directoryizabilityAdminRecordSchema>

export const directoryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  directoryizabilityPercent: z.number().min(0).max(100),
})
export type DirectoryizabilityAdminStats = z.infer<typeof directoryizabilityAdminStatsSchema>

export const directoryizabilityAdminActionSchema = z.enum(['refresh_directoryizability_summary'])
export type DirectoryizabilityAdminAction = z.infer<typeof directoryizabilityAdminActionSchema>

export const directoryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(directoryizabilityAdminRecordSchema),
  stats: directoryizabilityAdminStatsSchema,
  availableActions: z.array(directoryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DirectoryizabilityAdminSummaryResponse = z.infer<
  typeof directoryizabilityAdminSummaryResponseSchema
>

export const directoryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: directoryizabilityAdminActionSchema,
})
export type DirectoryizabilityAdminActionRequest = z.infer<
  typeof directoryizabilityAdminActionRequestSchema
>

export const directoryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: directoryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: directoryizabilityAdminStatsSchema.optional(),
})
export type DirectoryizabilityAdminActionResponse = z.infer<
  typeof directoryizabilityAdminActionResponseSchema
>
