import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const credibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CredibilityAdminDomain = z.infer<typeof credibilityAdminDomainSchema>

export const credibilityAdminRecordSchema = z.object({
  domain: credibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CredibilityAdminRecord = z.infer<typeof credibilityAdminRecordSchema>

export const credibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  credibilityPercent: z.number().min(0).max(100),
})
export type CredibilityAdminStats = z.infer<typeof credibilityAdminStatsSchema>

export const credibilityAdminActionSchema = z.enum(['refresh_credibility_summary'])
export type CredibilityAdminAction = z.infer<typeof credibilityAdminActionSchema>

export const credibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(credibilityAdminRecordSchema),
  stats: credibilityAdminStatsSchema,
  availableActions: z.array(credibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CredibilityAdminSummaryResponse = z.infer<
  typeof credibilityAdminSummaryResponseSchema
>

export const credibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: credibilityAdminActionSchema,
})
export type CredibilityAdminActionRequest = z.infer<
  typeof credibilityAdminActionRequestSchema
>

export const credibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: credibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: credibilityAdminStatsSchema.optional(),
})
export type CredibilityAdminActionResponse = z.infer<
  typeof credibilityAdminActionResponseSchema
>
