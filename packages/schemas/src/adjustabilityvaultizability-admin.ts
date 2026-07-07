import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const adjustabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type AdjustabilityvaultizabilityAdminDomain = z.infer<typeof adjustabilityvaultizabilityAdminDomainSchema>

export const adjustabilityvaultizabilityAdminRecordSchema = z.object({
  domain: adjustabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AdjustabilityvaultizabilityAdminRecord = z.infer<typeof adjustabilityvaultizabilityAdminRecordSchema>

export const adjustabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  adjustabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type AdjustabilityvaultizabilityAdminStats = z.infer<typeof adjustabilityvaultizabilityAdminStatsSchema>

export const adjustabilityvaultizabilityAdminActionSchema = z.enum(['refresh_adjustabilityvaultizability_summary'])
export type AdjustabilityvaultizabilityAdminAction = z.infer<typeof adjustabilityvaultizabilityAdminActionSchema>

export const adjustabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(adjustabilityvaultizabilityAdminRecordSchema),
  stats: adjustabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(adjustabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AdjustabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof adjustabilityvaultizabilityAdminSummaryResponseSchema
>

export const adjustabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adjustabilityvaultizabilityAdminActionSchema,
})
export type AdjustabilityvaultizabilityAdminActionRequest = z.infer<
  typeof adjustabilityvaultizabilityAdminActionRequestSchema
>

export const adjustabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: adjustabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: adjustabilityvaultizabilityAdminStatsSchema.optional(),
})
export type AdjustabilityvaultizabilityAdminActionResponse = z.infer<
  typeof adjustabilityvaultizabilityAdminActionResponseSchema
>
