import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const viabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ViabilityAdminDomain = z.infer<typeof viabilityAdminDomainSchema>

export const viabilityAdminRecordSchema = z.object({
  domain: viabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ViabilityAdminRecord = z.infer<typeof viabilityAdminRecordSchema>

export const viabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  viabilityPercent: z.number().min(0).max(100),
})
export type ViabilityAdminStats = z.infer<typeof viabilityAdminStatsSchema>

export const viabilityAdminActionSchema = z.enum(['refresh_viability_summary'])
export type ViabilityAdminAction = z.infer<typeof viabilityAdminActionSchema>

export const viabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(viabilityAdminRecordSchema),
  stats: viabilityAdminStatsSchema,
  availableActions: z.array(viabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ViabilityAdminSummaryResponse = z.infer<
  typeof viabilityAdminSummaryResponseSchema
>

export const viabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: viabilityAdminActionSchema,
})
export type ViabilityAdminActionRequest = z.infer<
  typeof viabilityAdminActionRequestSchema
>

export const viabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: viabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: viabilityAdminStatsSchema.optional(),
})
export type ViabilityAdminActionResponse = z.infer<
  typeof viabilityAdminActionResponseSchema
>
