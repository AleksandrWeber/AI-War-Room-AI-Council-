import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const diagnosabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type DiagnosabilizabilityAdminDomain = z.infer<typeof diagnosabilizabilityAdminDomainSchema>

export const diagnosabilizabilityAdminRecordSchema = z.object({
  domain: diagnosabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DiagnosabilizabilityAdminRecord = z.infer<typeof diagnosabilizabilityAdminRecordSchema>

export const diagnosabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  diagnosabilizabilityPercent: z.number().min(0).max(100),
})
export type DiagnosabilizabilityAdminStats = z.infer<typeof diagnosabilizabilityAdminStatsSchema>

export const diagnosabilizabilityAdminActionSchema = z.enum(['refresh_diagnosabilizability_summary'])
export type DiagnosabilizabilityAdminAction = z.infer<typeof diagnosabilizabilityAdminActionSchema>

export const diagnosabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(diagnosabilizabilityAdminRecordSchema),
  stats: diagnosabilizabilityAdminStatsSchema,
  availableActions: z.array(diagnosabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DiagnosabilizabilityAdminSummaryResponse = z.infer<
  typeof diagnosabilizabilityAdminSummaryResponseSchema
>

export const diagnosabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: diagnosabilizabilityAdminActionSchema,
})
export type DiagnosabilizabilityAdminActionRequest = z.infer<
  typeof diagnosabilizabilityAdminActionRequestSchema
>

export const diagnosabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: diagnosabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: diagnosabilizabilityAdminStatsSchema.optional(),
})
export type DiagnosabilizabilityAdminActionResponse = z.infer<
  typeof diagnosabilizabilityAdminActionResponseSchema
>
