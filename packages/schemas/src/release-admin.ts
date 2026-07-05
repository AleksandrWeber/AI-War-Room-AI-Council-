import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const releaseAdminDomainSchema = z.enum([
  'completed_runs',
  'artifacts',
  'run_workflows',
  'agent_outputs',
])
export type ReleaseAdminDomain = z.infer<typeof releaseAdminDomainSchema>

export const releaseAdminRecordSchema = z.object({
  domain: releaseAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReleaseAdminRecord = z.infer<typeof releaseAdminRecordSchema>

export const releaseAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  apiVersion: nonEmptyStringSchema,
})
export type ReleaseAdminStats = z.infer<typeof releaseAdminStatsSchema>

export const releaseAdminActionSchema = z.enum(['refresh_release_summary'])
export type ReleaseAdminAction = z.infer<typeof releaseAdminActionSchema>

export const releaseAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(releaseAdminRecordSchema),
  stats: releaseAdminStatsSchema,
  availableActions: z.array(releaseAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReleaseAdminSummaryResponse = z.infer<
  typeof releaseAdminSummaryResponseSchema
>

export const releaseAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: releaseAdminActionSchema,
})
export type ReleaseAdminActionRequest = z.infer<
  typeof releaseAdminActionRequestSchema
>

export const releaseAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: releaseAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: releaseAdminStatsSchema.optional(),
})
export type ReleaseAdminActionResponse = z.infer<
  typeof releaseAdminActionResponseSchema
>
