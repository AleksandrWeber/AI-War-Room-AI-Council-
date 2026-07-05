import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const expandizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ExpandizabilityAdminDomain = z.infer<typeof expandizabilityAdminDomainSchema>

export const expandizabilityAdminRecordSchema = z.object({
  domain: expandizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExpandizabilityAdminRecord = z.infer<typeof expandizabilityAdminRecordSchema>

export const expandizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  expandizabilityPercent: z.number().min(0).max(100),
})
export type ExpandizabilityAdminStats = z.infer<typeof expandizabilityAdminStatsSchema>

export const expandizabilityAdminActionSchema = z.enum(['refresh_expandizability_summary'])
export type ExpandizabilityAdminAction = z.infer<typeof expandizabilityAdminActionSchema>

export const expandizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(expandizabilityAdminRecordSchema),
  stats: expandizabilityAdminStatsSchema,
  availableActions: z.array(expandizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExpandizabilityAdminSummaryResponse = z.infer<
  typeof expandizabilityAdminSummaryResponseSchema
>

export const expandizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: expandizabilityAdminActionSchema,
})
export type ExpandizabilityAdminActionRequest = z.infer<
  typeof expandizabilityAdminActionRequestSchema
>

export const expandizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: expandizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: expandizabilityAdminStatsSchema.optional(),
})
export type ExpandizabilityAdminActionResponse = z.infer<
  typeof expandizabilityAdminActionResponseSchema
>
