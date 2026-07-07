import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const configurabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ConfigurabilityvaultizabilityAdminDomain = z.infer<typeof configurabilityvaultizabilityAdminDomainSchema>

export const configurabilityvaultizabilityAdminRecordSchema = z.object({
  domain: configurabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ConfigurabilityvaultizabilityAdminRecord = z.infer<typeof configurabilityvaultizabilityAdminRecordSchema>

export const configurabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  configurabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ConfigurabilityvaultizabilityAdminStats = z.infer<typeof configurabilityvaultizabilityAdminStatsSchema>

export const configurabilityvaultizabilityAdminActionSchema = z.enum(['refresh_configurabilityvaultizability_summary'])
export type ConfigurabilityvaultizabilityAdminAction = z.infer<typeof configurabilityvaultizabilityAdminActionSchema>

export const configurabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(configurabilityvaultizabilityAdminRecordSchema),
  stats: configurabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(configurabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ConfigurabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof configurabilityvaultizabilityAdminSummaryResponseSchema
>

export const configurabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: configurabilityvaultizabilityAdminActionSchema,
})
export type ConfigurabilityvaultizabilityAdminActionRequest = z.infer<
  typeof configurabilityvaultizabilityAdminActionRequestSchema
>

export const configurabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: configurabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: configurabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ConfigurabilityvaultizabilityAdminActionResponse = z.infer<
  typeof configurabilityvaultizabilityAdminActionResponseSchema
>
