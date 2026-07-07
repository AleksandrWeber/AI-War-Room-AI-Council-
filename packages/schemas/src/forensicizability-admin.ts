import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const forensicizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ForensicizabilityAdminDomain = z.infer<typeof forensicizabilityAdminDomainSchema>

export const forensicizabilityAdminRecordSchema = z.object({
  domain: forensicizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ForensicizabilityAdminRecord = z.infer<typeof forensicizabilityAdminRecordSchema>

export const forensicizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  forensicizabilityPercent: z.number().min(0).max(100),
})
export type ForensicizabilityAdminStats = z.infer<typeof forensicizabilityAdminStatsSchema>

export const forensicizabilityAdminActionSchema = z.enum(['refresh_forensicizability_summary'])
export type ForensicizabilityAdminAction = z.infer<typeof forensicizabilityAdminActionSchema>

export const forensicizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(forensicizabilityAdminRecordSchema),
  stats: forensicizabilityAdminStatsSchema,
  availableActions: z.array(forensicizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ForensicizabilityAdminSummaryResponse = z.infer<
  typeof forensicizabilityAdminSummaryResponseSchema
>

export const forensicizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: forensicizabilityAdminActionSchema,
})
export type ForensicizabilityAdminActionRequest = z.infer<
  typeof forensicizabilityAdminActionRequestSchema
>

export const forensicizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: forensicizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: forensicizabilityAdminStatsSchema.optional(),
})
export type ForensicizabilityAdminActionResponse = z.infer<
  typeof forensicizabilityAdminActionResponseSchema
>
