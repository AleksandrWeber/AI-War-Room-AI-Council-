import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const iterativizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type IterativizabilityAdminDomain = z.infer<typeof iterativizabilityAdminDomainSchema>

export const iterativizabilityAdminRecordSchema = z.object({
  domain: iterativizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type IterativizabilityAdminRecord = z.infer<typeof iterativizabilityAdminRecordSchema>

export const iterativizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  iterativizabilityPercent: z.number().min(0).max(100),
})
export type IterativizabilityAdminStats = z.infer<typeof iterativizabilityAdminStatsSchema>

export const iterativizabilityAdminActionSchema = z.enum(['refresh_iterativizability_summary'])
export type IterativizabilityAdminAction = z.infer<typeof iterativizabilityAdminActionSchema>

export const iterativizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(iterativizabilityAdminRecordSchema),
  stats: iterativizabilityAdminStatsSchema,
  availableActions: z.array(iterativizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type IterativizabilityAdminSummaryResponse = z.infer<
  typeof iterativizabilityAdminSummaryResponseSchema
>

export const iterativizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: iterativizabilityAdminActionSchema,
})
export type IterativizabilityAdminActionRequest = z.infer<
  typeof iterativizabilityAdminActionRequestSchema
>

export const iterativizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: iterativizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: iterativizabilityAdminStatsSchema.optional(),
})
export type IterativizabilityAdminActionResponse = z.infer<
  typeof iterativizabilityAdminActionResponseSchema
>
