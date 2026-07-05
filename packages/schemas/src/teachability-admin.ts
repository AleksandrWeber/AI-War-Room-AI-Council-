import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const teachabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'agent_outputs',
])
export type TeachabilityAdminDomain = z.infer<typeof teachabilityAdminDomainSchema>

export const teachabilityAdminRecordSchema = z.object({
  domain: teachabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TeachabilityAdminRecord = z.infer<typeof teachabilityAdminRecordSchema>

export const teachabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  teachabilityPercent: z.number().min(0).max(100),
})
export type TeachabilityAdminStats = z.infer<typeof teachabilityAdminStatsSchema>

export const teachabilityAdminActionSchema = z.enum(['refresh_teachability_summary'])
export type TeachabilityAdminAction = z.infer<typeof teachabilityAdminActionSchema>

export const teachabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(teachabilityAdminRecordSchema),
  stats: teachabilityAdminStatsSchema,
  availableActions: z.array(teachabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TeachabilityAdminSummaryResponse = z.infer<
  typeof teachabilityAdminSummaryResponseSchema
>

export const teachabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: teachabilityAdminActionSchema,
})
export type TeachabilityAdminActionRequest = z.infer<
  typeof teachabilityAdminActionRequestSchema
>

export const teachabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: teachabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: teachabilityAdminStatsSchema.optional(),
})
export type TeachabilityAdminActionResponse = z.infer<
  typeof teachabilityAdminActionResponseSchema
>
