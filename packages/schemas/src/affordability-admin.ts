import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const affordabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AffordabilityAdminDomain = z.infer<typeof affordabilityAdminDomainSchema>

export const affordabilityAdminRecordSchema = z.object({
  domain: affordabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AffordabilityAdminRecord = z.infer<typeof affordabilityAdminRecordSchema>

export const affordabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  affordabilityPercent: z.number().min(0).max(100),
})
export type AffordabilityAdminStats = z.infer<typeof affordabilityAdminStatsSchema>

export const affordabilityAdminActionSchema = z.enum(['refresh_affordability_summary'])
export type AffordabilityAdminAction = z.infer<typeof affordabilityAdminActionSchema>

export const affordabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(affordabilityAdminRecordSchema),
  stats: affordabilityAdminStatsSchema,
  availableActions: z.array(affordabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AffordabilityAdminSummaryResponse = z.infer<
  typeof affordabilityAdminSummaryResponseSchema
>

export const affordabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: affordabilityAdminActionSchema,
})
export type AffordabilityAdminActionRequest = z.infer<
  typeof affordabilityAdminActionRequestSchema
>

export const affordabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: affordabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: affordabilityAdminStatsSchema.optional(),
})
export type AffordabilityAdminActionResponse = z.infer<
  typeof affordabilityAdminActionResponseSchema
>
