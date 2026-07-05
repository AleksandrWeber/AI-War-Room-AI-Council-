import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const appendizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AppendizabilityAdminDomain = z.infer<typeof appendizabilityAdminDomainSchema>

export const appendizabilityAdminRecordSchema = z.object({
  domain: appendizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AppendizabilityAdminRecord = z.infer<typeof appendizabilityAdminRecordSchema>

export const appendizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  appendizabilityPercent: z.number().min(0).max(100),
})
export type AppendizabilityAdminStats = z.infer<typeof appendizabilityAdminStatsSchema>

export const appendizabilityAdminActionSchema = z.enum(['refresh_appendizability_summary'])
export type AppendizabilityAdminAction = z.infer<typeof appendizabilityAdminActionSchema>

export const appendizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(appendizabilityAdminRecordSchema),
  stats: appendizabilityAdminStatsSchema,
  availableActions: z.array(appendizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AppendizabilityAdminSummaryResponse = z.infer<
  typeof appendizabilityAdminSummaryResponseSchema
>

export const appendizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: appendizabilityAdminActionSchema,
})
export type AppendizabilityAdminActionRequest = z.infer<
  typeof appendizabilityAdminActionRequestSchema
>

export const appendizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: appendizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: appendizabilityAdminStatsSchema.optional(),
})
export type AppendizabilityAdminActionResponse = z.infer<
  typeof appendizabilityAdminActionResponseSchema
>
