import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const mythicizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'run_workflows',
])
export type MythicizabilityAdminDomain = z.infer<typeof mythicizabilityAdminDomainSchema>

export const mythicizabilityAdminRecordSchema = z.object({
  domain: mythicizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MythicizabilityAdminRecord = z.infer<typeof mythicizabilityAdminRecordSchema>

export const mythicizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  mythicizabilityPercent: z.number().min(0).max(100),
})
export type MythicizabilityAdminStats = z.infer<typeof mythicizabilityAdminStatsSchema>

export const mythicizabilityAdminActionSchema = z.enum(['refresh_mythicizability_summary'])
export type MythicizabilityAdminAction = z.infer<typeof mythicizabilityAdminActionSchema>

export const mythicizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(mythicizabilityAdminRecordSchema),
  stats: mythicizabilityAdminStatsSchema,
  availableActions: z.array(mythicizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MythicizabilityAdminSummaryResponse = z.infer<
  typeof mythicizabilityAdminSummaryResponseSchema
>

export const mythicizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mythicizabilityAdminActionSchema,
})
export type MythicizabilityAdminActionRequest = z.infer<
  typeof mythicizabilityAdminActionRequestSchema
>

export const mythicizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: mythicizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: mythicizabilityAdminStatsSchema.optional(),
})
export type MythicizabilityAdminActionResponse = z.infer<
  typeof mythicizabilityAdminActionResponseSchema
>
