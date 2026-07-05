import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const schedulizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type SchedulizabilityAdminDomain = z.infer<typeof schedulizabilityAdminDomainSchema>

export const schedulizabilityAdminRecordSchema = z.object({
  domain: schedulizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SchedulizabilityAdminRecord = z.infer<typeof schedulizabilityAdminRecordSchema>

export const schedulizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  schedulizabilityPercent: z.number().min(0).max(100),
})
export type SchedulizabilityAdminStats = z.infer<typeof schedulizabilityAdminStatsSchema>

export const schedulizabilityAdminActionSchema = z.enum(['refresh_schedulizability_summary'])
export type SchedulizabilityAdminAction = z.infer<typeof schedulizabilityAdminActionSchema>

export const schedulizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(schedulizabilityAdminRecordSchema),
  stats: schedulizabilityAdminStatsSchema,
  availableActions: z.array(schedulizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SchedulizabilityAdminSummaryResponse = z.infer<
  typeof schedulizabilityAdminSummaryResponseSchema
>

export const schedulizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulizabilityAdminActionSchema,
})
export type SchedulizabilityAdminActionRequest = z.infer<
  typeof schedulizabilityAdminActionRequestSchema
>

export const schedulizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: schedulizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: schedulizabilityAdminStatsSchema.optional(),
})
export type SchedulizabilityAdminActionResponse = z.infer<
  typeof schedulizabilityAdminActionResponseSchema
>
