import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const splitizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type SplitizabilityAdminDomain = z.infer<typeof splitizabilityAdminDomainSchema>

export const splitizabilityAdminRecordSchema = z.object({
  domain: splitizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SplitizabilityAdminRecord = z.infer<typeof splitizabilityAdminRecordSchema>

export const splitizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  splitizabilityPercent: z.number().min(0).max(100),
})
export type SplitizabilityAdminStats = z.infer<typeof splitizabilityAdminStatsSchema>

export const splitizabilityAdminActionSchema = z.enum(['refresh_splitizability_summary'])
export type SplitizabilityAdminAction = z.infer<typeof splitizabilityAdminActionSchema>

export const splitizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(splitizabilityAdminRecordSchema),
  stats: splitizabilityAdminStatsSchema,
  availableActions: z.array(splitizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SplitizabilityAdminSummaryResponse = z.infer<
  typeof splitizabilityAdminSummaryResponseSchema
>

export const splitizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: splitizabilityAdminActionSchema,
})
export type SplitizabilityAdminActionRequest = z.infer<
  typeof splitizabilityAdminActionRequestSchema
>

export const splitizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: splitizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: splitizabilityAdminStatsSchema.optional(),
})
export type SplitizabilityAdminActionResponse = z.infer<
  typeof splitizabilityAdminActionResponseSchema
>
