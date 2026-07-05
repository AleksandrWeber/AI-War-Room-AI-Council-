import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const ttlizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type TtlizabilityAdminDomain = z.infer<typeof ttlizabilityAdminDomainSchema>

export const ttlizabilityAdminRecordSchema = z.object({
  domain: ttlizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TtlizabilityAdminRecord = z.infer<typeof ttlizabilityAdminRecordSchema>

export const ttlizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  ttlizabilityPercent: z.number().min(0).max(100),
})
export type TtlizabilityAdminStats = z.infer<typeof ttlizabilityAdminStatsSchema>

export const ttlizabilityAdminActionSchema = z.enum(['refresh_ttlizability_summary'])
export type TtlizabilityAdminAction = z.infer<typeof ttlizabilityAdminActionSchema>

export const ttlizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(ttlizabilityAdminRecordSchema),
  stats: ttlizabilityAdminStatsSchema,
  availableActions: z.array(ttlizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TtlizabilityAdminSummaryResponse = z.infer<
  typeof ttlizabilityAdminSummaryResponseSchema
>

export const ttlizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ttlizabilityAdminActionSchema,
})
export type TtlizabilityAdminActionRequest = z.infer<
  typeof ttlizabilityAdminActionRequestSchema
>

export const ttlizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: ttlizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: ttlizabilityAdminStatsSchema.optional(),
})
export type TtlizabilityAdminActionResponse = z.infer<
  typeof ttlizabilityAdminActionResponseSchema
>
