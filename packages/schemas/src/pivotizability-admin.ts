import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const pivotizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type PivotizabilityAdminDomain = z.infer<typeof pivotizabilityAdminDomainSchema>

export const pivotizabilityAdminRecordSchema = z.object({
  domain: pivotizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type PivotizabilityAdminRecord = z.infer<typeof pivotizabilityAdminRecordSchema>

export const pivotizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  pivotizabilityPercent: z.number().min(0).max(100),
})
export type PivotizabilityAdminStats = z.infer<typeof pivotizabilityAdminStatsSchema>

export const pivotizabilityAdminActionSchema = z.enum(['refresh_pivotizability_summary'])
export type PivotizabilityAdminAction = z.infer<typeof pivotizabilityAdminActionSchema>

export const pivotizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(pivotizabilityAdminRecordSchema),
  stats: pivotizabilityAdminStatsSchema,
  availableActions: z.array(pivotizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type PivotizabilityAdminSummaryResponse = z.infer<
  typeof pivotizabilityAdminSummaryResponseSchema
>

export const pivotizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pivotizabilityAdminActionSchema,
})
export type PivotizabilityAdminActionRequest = z.infer<
  typeof pivotizabilityAdminActionRequestSchema
>

export const pivotizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: pivotizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: pivotizabilityAdminStatsSchema.optional(),
})
export type PivotizabilityAdminActionResponse = z.infer<
  typeof pivotizabilityAdminActionResponseSchema
>
