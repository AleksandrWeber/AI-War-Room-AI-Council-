import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const adjustabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'workspace_memberships',
])
export type AdjustabilityAdminDomain = z.infer<typeof adjustabilityAdminDomainSchema>

export const adjustabilityAdminRecordSchema = z.object({
  domain: adjustabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AdjustabilityAdminRecord = z.infer<typeof adjustabilityAdminRecordSchema>

export const adjustabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  adjustabilityPercent: z.number().min(0).max(100),
})
export type AdjustabilityAdminStats = z.infer<typeof adjustabilityAdminStatsSchema>

export const adjustabilityAdminActionSchema = z.enum(['refresh_adjustability_summary'])
export type AdjustabilityAdminAction = z.infer<typeof adjustabilityAdminActionSchema>

export const adjustabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(adjustabilityAdminRecordSchema),
  stats: adjustabilityAdminStatsSchema,
  availableActions: z.array(adjustabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AdjustabilityAdminSummaryResponse = z.infer<
  typeof adjustabilityAdminSummaryResponseSchema
>

export const adjustabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adjustabilityAdminActionSchema,
})
export type AdjustabilityAdminActionRequest = z.infer<
  typeof adjustabilityAdminActionRequestSchema
>

export const adjustabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adjustabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: adjustabilityAdminStatsSchema.optional(),
})
export type AdjustabilityAdminActionResponse = z.infer<
  typeof adjustabilityAdminActionResponseSchema
>
