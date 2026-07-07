import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const repeatabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type RepeatabilityvaultizabilityAdminDomain = z.infer<typeof repeatabilityvaultizabilityAdminDomainSchema>

export const repeatabilityvaultizabilityAdminRecordSchema = z.object({
  domain: repeatabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RepeatabilityvaultizabilityAdminRecord = z.infer<typeof repeatabilityvaultizabilityAdminRecordSchema>

export const repeatabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  repeatabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type RepeatabilityvaultizabilityAdminStats = z.infer<typeof repeatabilityvaultizabilityAdminStatsSchema>

export const repeatabilityvaultizabilityAdminActionSchema = z.enum(['refresh_repeatabilityvaultizability_summary'])
export type RepeatabilityvaultizabilityAdminAction = z.infer<typeof repeatabilityvaultizabilityAdminActionSchema>

export const repeatabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(repeatabilityvaultizabilityAdminRecordSchema),
  stats: repeatabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(repeatabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RepeatabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof repeatabilityvaultizabilityAdminSummaryResponseSchema
>

export const repeatabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: repeatabilityvaultizabilityAdminActionSchema,
})
export type RepeatabilityvaultizabilityAdminActionRequest = z.infer<
  typeof repeatabilityvaultizabilityAdminActionRequestSchema
>

export const repeatabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: repeatabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: repeatabilityvaultizabilityAdminStatsSchema.optional(),
})
export type RepeatabilityvaultizabilityAdminActionResponse = z.infer<
  typeof repeatabilityvaultizabilityAdminActionResponseSchema
>
