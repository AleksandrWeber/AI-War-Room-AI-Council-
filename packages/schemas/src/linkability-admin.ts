import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const linkabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'artifacts',
])
export type LinkabilityAdminDomain = z.infer<typeof linkabilityAdminDomainSchema>

export const linkabilityAdminRecordSchema = z.object({
  domain: linkabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LinkabilityAdminRecord = z.infer<typeof linkabilityAdminRecordSchema>

export const linkabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  linkabilityPercent: z.number().min(0).max(100),
})
export type LinkabilityAdminStats = z.infer<typeof linkabilityAdminStatsSchema>

export const linkabilityAdminActionSchema = z.enum(['refresh_linkability_summary'])
export type LinkabilityAdminAction = z.infer<typeof linkabilityAdminActionSchema>

export const linkabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(linkabilityAdminRecordSchema),
  stats: linkabilityAdminStatsSchema,
  availableActions: z.array(linkabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LinkabilityAdminSummaryResponse = z.infer<
  typeof linkabilityAdminSummaryResponseSchema
>

export const linkabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: linkabilityAdminActionSchema,
})
export type LinkabilityAdminActionRequest = z.infer<
  typeof linkabilityAdminActionRequestSchema
>

export const linkabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: linkabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: linkabilityAdminStatsSchema.optional(),
})
export type LinkabilityAdminActionResponse = z.infer<
  typeof linkabilityAdminActionResponseSchema
>
