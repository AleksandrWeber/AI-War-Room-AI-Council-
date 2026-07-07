import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const warrantabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type WarrantabilityvaultizabilityAdminDomain = z.infer<typeof warrantabilityvaultizabilityAdminDomainSchema>

export const warrantabilityvaultizabilityAdminRecordSchema = z.object({
  domain: warrantabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WarrantabilityvaultizabilityAdminRecord = z.infer<typeof warrantabilityvaultizabilityAdminRecordSchema>

export const warrantabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  warrantabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type WarrantabilityvaultizabilityAdminStats = z.infer<typeof warrantabilityvaultizabilityAdminStatsSchema>

export const warrantabilityvaultizabilityAdminActionSchema = z.enum(['refresh_warrantabilityvaultizability_summary'])
export type WarrantabilityvaultizabilityAdminAction = z.infer<typeof warrantabilityvaultizabilityAdminActionSchema>

export const warrantabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(warrantabilityvaultizabilityAdminRecordSchema),
  stats: warrantabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(warrantabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WarrantabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof warrantabilityvaultizabilityAdminSummaryResponseSchema
>

export const warrantabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: warrantabilityvaultizabilityAdminActionSchema,
})
export type WarrantabilityvaultizabilityAdminActionRequest = z.infer<
  typeof warrantabilityvaultizabilityAdminActionRequestSchema
>

export const warrantabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: warrantabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: warrantabilityvaultizabilityAdminStatsSchema.optional(),
})
export type WarrantabilityvaultizabilityAdminActionResponse = z.infer<
  typeof warrantabilityvaultizabilityAdminActionResponseSchema
>
