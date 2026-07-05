import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const scanizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type ScanizabilityAdminDomain = z.infer<typeof scanizabilityAdminDomainSchema>

export const scanizabilityAdminRecordSchema = z.object({
  domain: scanizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ScanizabilityAdminRecord = z.infer<typeof scanizabilityAdminRecordSchema>

export const scanizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  scanizabilityPercent: z.number().min(0).max(100),
})
export type ScanizabilityAdminStats = z.infer<typeof scanizabilityAdminStatsSchema>

export const scanizabilityAdminActionSchema = z.enum(['refresh_scanizability_summary'])
export type ScanizabilityAdminAction = z.infer<typeof scanizabilityAdminActionSchema>

export const scanizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(scanizabilityAdminRecordSchema),
  stats: scanizabilityAdminStatsSchema,
  availableActions: z.array(scanizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ScanizabilityAdminSummaryResponse = z.infer<
  typeof scanizabilityAdminSummaryResponseSchema
>

export const scanizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scanizabilityAdminActionSchema,
})
export type ScanizabilityAdminActionRequest = z.infer<
  typeof scanizabilityAdminActionRequestSchema
>

export const scanizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scanizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: scanizabilityAdminStatsSchema.optional(),
})
export type ScanizabilityAdminActionResponse = z.infer<
  typeof scanizabilityAdminActionResponseSchema
>
