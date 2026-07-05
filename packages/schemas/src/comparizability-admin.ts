import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const comparizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ComparizabilityAdminDomain = z.infer<typeof comparizabilityAdminDomainSchema>

export const comparizabilityAdminRecordSchema = z.object({
  domain: comparizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComparizabilityAdminRecord = z.infer<typeof comparizabilityAdminRecordSchema>

export const comparizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  comparizabilityPercent: z.number().min(0).max(100),
})
export type ComparizabilityAdminStats = z.infer<typeof comparizabilityAdminStatsSchema>

export const comparizabilityAdminActionSchema = z.enum(['refresh_comparizability_summary'])
export type ComparizabilityAdminAction = z.infer<typeof comparizabilityAdminActionSchema>

export const comparizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(comparizabilityAdminRecordSchema),
  stats: comparizabilityAdminStatsSchema,
  availableActions: z.array(comparizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComparizabilityAdminSummaryResponse = z.infer<
  typeof comparizabilityAdminSummaryResponseSchema
>

export const comparizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comparizabilityAdminActionSchema,
})
export type ComparizabilityAdminActionRequest = z.infer<
  typeof comparizabilityAdminActionRequestSchema
>

export const comparizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: comparizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: comparizabilityAdminStatsSchema.optional(),
})
export type ComparizabilityAdminActionResponse = z.infer<
  typeof comparizabilityAdminActionResponseSchema
>
