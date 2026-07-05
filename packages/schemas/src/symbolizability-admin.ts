import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const symbolizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'billing_invoices',
])
export type SymbolizabilityAdminDomain = z.infer<typeof symbolizabilityAdminDomainSchema>

export const symbolizabilityAdminRecordSchema = z.object({
  domain: symbolizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SymbolizabilityAdminRecord = z.infer<typeof symbolizabilityAdminRecordSchema>

export const symbolizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  symbolizabilityPercent: z.number().min(0).max(100),
})
export type SymbolizabilityAdminStats = z.infer<typeof symbolizabilityAdminStatsSchema>

export const symbolizabilityAdminActionSchema = z.enum(['refresh_symbolizability_summary'])
export type SymbolizabilityAdminAction = z.infer<typeof symbolizabilityAdminActionSchema>

export const symbolizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(symbolizabilityAdminRecordSchema),
  stats: symbolizabilityAdminStatsSchema,
  availableActions: z.array(symbolizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SymbolizabilityAdminSummaryResponse = z.infer<
  typeof symbolizabilityAdminSummaryResponseSchema
>

export const symbolizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: symbolizabilityAdminActionSchema,
})
export type SymbolizabilityAdminActionRequest = z.infer<
  typeof symbolizabilityAdminActionRequestSchema
>

export const symbolizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: symbolizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: symbolizabilityAdminStatsSchema.optional(),
})
export type SymbolizabilityAdminActionResponse = z.infer<
  typeof symbolizabilityAdminActionResponseSchema
>
