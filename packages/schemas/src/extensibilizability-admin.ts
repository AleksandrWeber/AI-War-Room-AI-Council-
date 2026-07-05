import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const extensibilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ExtensibilizabilityAdminDomain = z.infer<typeof extensibilizabilityAdminDomainSchema>

export const extensibilizabilityAdminRecordSchema = z.object({
  domain: extensibilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExtensibilizabilityAdminRecord = z.infer<typeof extensibilizabilityAdminRecordSchema>

export const extensibilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  extensibilizabilityPercent: z.number().min(0).max(100),
})
export type ExtensibilizabilityAdminStats = z.infer<typeof extensibilizabilityAdminStatsSchema>

export const extensibilizabilityAdminActionSchema = z.enum(['refresh_extensibilizability_summary'])
export type ExtensibilizabilityAdminAction = z.infer<typeof extensibilizabilityAdminActionSchema>

export const extensibilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(extensibilizabilityAdminRecordSchema),
  stats: extensibilizabilityAdminStatsSchema,
  availableActions: z.array(extensibilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExtensibilizabilityAdminSummaryResponse = z.infer<
  typeof extensibilizabilityAdminSummaryResponseSchema
>

export const extensibilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extensibilizabilityAdminActionSchema,
})
export type ExtensibilizabilityAdminActionRequest = z.infer<
  typeof extensibilizabilityAdminActionRequestSchema
>

export const extensibilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extensibilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: extensibilizabilityAdminStatsSchema.optional(),
})
export type ExtensibilizabilityAdminActionResponse = z.infer<
  typeof extensibilizabilityAdminActionResponseSchema
>
