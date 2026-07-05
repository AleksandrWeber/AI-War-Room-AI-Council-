import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const corroborizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type CorroborizabilityAdminDomain = z.infer<typeof corroborizabilityAdminDomainSchema>

export const corroborizabilityAdminRecordSchema = z.object({
  domain: corroborizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CorroborizabilityAdminRecord = z.infer<typeof corroborizabilityAdminRecordSchema>

export const corroborizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  corroborizabilityPercent: z.number().min(0).max(100),
})
export type CorroborizabilityAdminStats = z.infer<typeof corroborizabilityAdminStatsSchema>

export const corroborizabilityAdminActionSchema = z.enum(['refresh_corroborizability_summary'])
export type CorroborizabilityAdminAction = z.infer<typeof corroborizabilityAdminActionSchema>

export const corroborizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(corroborizabilityAdminRecordSchema),
  stats: corroborizabilityAdminStatsSchema,
  availableActions: z.array(corroborizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CorroborizabilityAdminSummaryResponse = z.infer<
  typeof corroborizabilityAdminSummaryResponseSchema
>

export const corroborizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: corroborizabilityAdminActionSchema,
})
export type CorroborizabilityAdminActionRequest = z.infer<
  typeof corroborizabilityAdminActionRequestSchema
>

export const corroborizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: corroborizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: corroborizabilityAdminStatsSchema.optional(),
})
export type CorroborizabilityAdminActionResponse = z.infer<
  typeof corroborizabilityAdminActionResponseSchema
>
