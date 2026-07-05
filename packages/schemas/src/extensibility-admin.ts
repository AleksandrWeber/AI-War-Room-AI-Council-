import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const extensibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'agent_outputs',
  'artifacts',
])
export type ExtensibilityAdminDomain = z.infer<typeof extensibilityAdminDomainSchema>

export const extensibilityAdminRecordSchema = z.object({
  domain: extensibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExtensibilityAdminRecord = z.infer<typeof extensibilityAdminRecordSchema>

export const extensibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  extensibilityPercent: z.number().min(0).max(100),
})
export type ExtensibilityAdminStats = z.infer<typeof extensibilityAdminStatsSchema>

export const extensibilityAdminActionSchema = z.enum(['refresh_extensibility_summary'])
export type ExtensibilityAdminAction = z.infer<typeof extensibilityAdminActionSchema>

export const extensibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(extensibilityAdminRecordSchema),
  stats: extensibilityAdminStatsSchema,
  availableActions: z.array(extensibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExtensibilityAdminSummaryResponse = z.infer<
  typeof extensibilityAdminSummaryResponseSchema
>

export const extensibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extensibilityAdminActionSchema,
})
export type ExtensibilityAdminActionRequest = z.infer<
  typeof extensibilityAdminActionRequestSchema
>

export const extensibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extensibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: extensibilityAdminStatsSchema.optional(),
})
export type ExtensibilityAdminActionResponse = z.infer<
  typeof extensibilityAdminActionResponseSchema
>
