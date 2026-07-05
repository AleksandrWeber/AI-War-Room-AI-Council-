import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const demonstrabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'billing_notifications',
])
export type DemonstrabilityAdminDomain = z.infer<typeof demonstrabilityAdminDomainSchema>

export const demonstrabilityAdminRecordSchema = z.object({
  domain: demonstrabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DemonstrabilityAdminRecord = z.infer<typeof demonstrabilityAdminRecordSchema>

export const demonstrabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  demonstrabilityPercent: z.number().min(0).max(100),
})
export type DemonstrabilityAdminStats = z.infer<typeof demonstrabilityAdminStatsSchema>

export const demonstrabilityAdminActionSchema = z.enum(['refresh_demonstrability_summary'])
export type DemonstrabilityAdminAction = z.infer<typeof demonstrabilityAdminActionSchema>

export const demonstrabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(demonstrabilityAdminRecordSchema),
  stats: demonstrabilityAdminStatsSchema,
  availableActions: z.array(demonstrabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DemonstrabilityAdminSummaryResponse = z.infer<
  typeof demonstrabilityAdminSummaryResponseSchema
>

export const demonstrabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: demonstrabilityAdminActionSchema,
})
export type DemonstrabilityAdminActionRequest = z.infer<
  typeof demonstrabilityAdminActionRequestSchema
>

export const demonstrabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: demonstrabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: demonstrabilityAdminStatsSchema.optional(),
})
export type DemonstrabilityAdminActionResponse = z.infer<
  typeof demonstrabilityAdminActionResponseSchema
>
