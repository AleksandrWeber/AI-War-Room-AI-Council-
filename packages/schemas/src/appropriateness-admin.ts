import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const appropriatenessAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type AppropriatenessAdminDomain = z.infer<typeof appropriatenessAdminDomainSchema>

export const appropriatenessAdminRecordSchema = z.object({
  domain: appropriatenessAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AppropriatenessAdminRecord = z.infer<typeof appropriatenessAdminRecordSchema>

export const appropriatenessAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  appropriatenessPercent: z.number().min(0).max(100),
})
export type AppropriatenessAdminStats = z.infer<typeof appropriatenessAdminStatsSchema>

export const appropriatenessAdminActionSchema = z.enum(['refresh_appropriateness_summary'])
export type AppropriatenessAdminAction = z.infer<typeof appropriatenessAdminActionSchema>

export const appropriatenessAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(appropriatenessAdminRecordSchema),
  stats: appropriatenessAdminStatsSchema,
  availableActions: z.array(appropriatenessAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AppropriatenessAdminSummaryResponse = z.infer<
  typeof appropriatenessAdminSummaryResponseSchema
>

export const appropriatenessAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: appropriatenessAdminActionSchema,
})
export type AppropriatenessAdminActionRequest = z.infer<
  typeof appropriatenessAdminActionRequestSchema
>

export const appropriatenessAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: appropriatenessAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: appropriatenessAdminStatsSchema.optional(),
})
export type AppropriatenessAdminActionResponse = z.infer<
  typeof appropriatenessAdminActionResponseSchema
>
