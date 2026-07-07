import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const riskizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type RiskizabilityAdminDomain = z.infer<typeof riskizabilityAdminDomainSchema>

export const riskizabilityAdminRecordSchema = z.object({
  domain: riskizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RiskizabilityAdminRecord = z.infer<typeof riskizabilityAdminRecordSchema>

export const riskizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  riskizabilityPercent: z.number().min(0).max(100),
})
export type RiskizabilityAdminStats = z.infer<typeof riskizabilityAdminStatsSchema>

export const riskizabilityAdminActionSchema = z.enum(['refresh_riskizability_summary'])
export type RiskizabilityAdminAction = z.infer<typeof riskizabilityAdminActionSchema>

export const riskizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(riskizabilityAdminRecordSchema),
  stats: riskizabilityAdminStatsSchema,
  availableActions: z.array(riskizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RiskizabilityAdminSummaryResponse = z.infer<
  typeof riskizabilityAdminSummaryResponseSchema
>

export const riskizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: riskizabilityAdminActionSchema,
})
export type RiskizabilityAdminActionRequest = z.infer<
  typeof riskizabilityAdminActionRequestSchema
>

export const riskizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: riskizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: riskizabilityAdminStatsSchema.optional(),
})
export type RiskizabilityAdminActionResponse = z.infer<
  typeof riskizabilityAdminActionResponseSchema
>
