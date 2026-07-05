import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const alertabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AlertabilizabilityAdminDomain = z.infer<typeof alertabilizabilityAdminDomainSchema>

export const alertabilizabilityAdminRecordSchema = z.object({
  domain: alertabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AlertabilizabilityAdminRecord = z.infer<typeof alertabilizabilityAdminRecordSchema>

export const alertabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  alertabilizabilityPercent: z.number().min(0).max(100),
})
export type AlertabilizabilityAdminStats = z.infer<typeof alertabilizabilityAdminStatsSchema>

export const alertabilizabilityAdminActionSchema = z.enum(['refresh_alertabilizability_summary'])
export type AlertabilizabilityAdminAction = z.infer<typeof alertabilizabilityAdminActionSchema>

export const alertabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(alertabilizabilityAdminRecordSchema),
  stats: alertabilizabilityAdminStatsSchema,
  availableActions: z.array(alertabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AlertabilizabilityAdminSummaryResponse = z.infer<
  typeof alertabilizabilityAdminSummaryResponseSchema
>

export const alertabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: alertabilizabilityAdminActionSchema,
})
export type AlertabilizabilityAdminActionRequest = z.infer<
  typeof alertabilizabilityAdminActionRequestSchema
>

export const alertabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: alertabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: alertabilizabilityAdminStatsSchema.optional(),
})
export type AlertabilizabilityAdminActionResponse = z.infer<
  typeof alertabilizabilityAdminActionResponseSchema
>
