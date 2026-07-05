import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const profitabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'billing_invoices',
])
export type ProfitabilityAdminDomain = z.infer<typeof profitabilityAdminDomainSchema>

export const profitabilityAdminRecordSchema = z.object({
  domain: profitabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ProfitabilityAdminRecord = z.infer<typeof profitabilityAdminRecordSchema>

export const profitabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  profitabilityPercent: z.number().min(0).max(100),
})
export type ProfitabilityAdminStats = z.infer<typeof profitabilityAdminStatsSchema>

export const profitabilityAdminActionSchema = z.enum(['refresh_profitability_summary'])
export type ProfitabilityAdminAction = z.infer<typeof profitabilityAdminActionSchema>

export const profitabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(profitabilityAdminRecordSchema),
  stats: profitabilityAdminStatsSchema,
  availableActions: z.array(profitabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProfitabilityAdminSummaryResponse = z.infer<
  typeof profitabilityAdminSummaryResponseSchema
>

export const profitabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: profitabilityAdminActionSchema,
})
export type ProfitabilityAdminActionRequest = z.infer<
  typeof profitabilityAdminActionRequestSchema
>

export const profitabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: profitabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: profitabilityAdminStatsSchema.optional(),
})
export type ProfitabilityAdminActionResponse = z.infer<
  typeof profitabilityAdminActionResponseSchema
>
