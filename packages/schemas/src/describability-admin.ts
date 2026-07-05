import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const describabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'agent_outputs',
])
export type DescribabilityAdminDomain = z.infer<typeof describabilityAdminDomainSchema>

export const describabilityAdminRecordSchema = z.object({
  domain: describabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DescribabilityAdminRecord = z.infer<typeof describabilityAdminRecordSchema>

export const describabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  describabilityPercent: z.number().min(0).max(100),
})
export type DescribabilityAdminStats = z.infer<typeof describabilityAdminStatsSchema>

export const describabilityAdminActionSchema = z.enum(['refresh_describability_summary'])
export type DescribabilityAdminAction = z.infer<typeof describabilityAdminActionSchema>

export const describabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(describabilityAdminRecordSchema),
  stats: describabilityAdminStatsSchema,
  availableActions: z.array(describabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DescribabilityAdminSummaryResponse = z.infer<
  typeof describabilityAdminSummaryResponseSchema
>

export const describabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: describabilityAdminActionSchema,
})
export type DescribabilityAdminActionRequest = z.infer<
  typeof describabilityAdminActionRequestSchema
>

export const describabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: describabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: describabilityAdminStatsSchema.optional(),
})
export type DescribabilityAdminActionResponse = z.infer<
  typeof describabilityAdminActionResponseSchema
>
