import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const dependabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'billing_invoices',
])
export type DependabilityAdminDomain = z.infer<typeof dependabilityAdminDomainSchema>

export const dependabilityAdminRecordSchema = z.object({
  domain: dependabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DependabilityAdminRecord = z.infer<typeof dependabilityAdminRecordSchema>

export const dependabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  dependabilityPercent: z.number().min(0).max(100),
})
export type DependabilityAdminStats = z.infer<typeof dependabilityAdminStatsSchema>

export const dependabilityAdminActionSchema = z.enum(['refresh_dependability_summary'])
export type DependabilityAdminAction = z.infer<typeof dependabilityAdminActionSchema>

export const dependabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(dependabilityAdminRecordSchema),
  stats: dependabilityAdminStatsSchema,
  availableActions: z.array(dependabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DependabilityAdminSummaryResponse = z.infer<
  typeof dependabilityAdminSummaryResponseSchema
>

export const dependabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dependabilityAdminActionSchema,
})
export type DependabilityAdminActionRequest = z.infer<
  typeof dependabilityAdminActionRequestSchema
>

export const dependabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dependabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: dependabilityAdminStatsSchema.optional(),
})
export type DependabilityAdminActionResponse = z.infer<
  typeof dependabilityAdminActionResponseSchema
>
