import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const warrantabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'run_workflows',
])
export type WarrantabilityAdminDomain = z.infer<typeof warrantabilityAdminDomainSchema>

export const warrantabilityAdminRecordSchema = z.object({
  domain: warrantabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type WarrantabilityAdminRecord = z.infer<typeof warrantabilityAdminRecordSchema>

export const warrantabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  warrantabilityPercent: z.number().min(0).max(100),
})
export type WarrantabilityAdminStats = z.infer<typeof warrantabilityAdminStatsSchema>

export const warrantabilityAdminActionSchema = z.enum(['refresh_warrantability_summary'])
export type WarrantabilityAdminAction = z.infer<typeof warrantabilityAdminActionSchema>

export const warrantabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(warrantabilityAdminRecordSchema),
  stats: warrantabilityAdminStatsSchema,
  availableActions: z.array(warrantabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type WarrantabilityAdminSummaryResponse = z.infer<
  typeof warrantabilityAdminSummaryResponseSchema
>

export const warrantabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: warrantabilityAdminActionSchema,
})
export type WarrantabilityAdminActionRequest = z.infer<
  typeof warrantabilityAdminActionRequestSchema
>

export const warrantabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: warrantabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: warrantabilityAdminStatsSchema.optional(),
})
export type WarrantabilityAdminActionResponse = z.infer<
  typeof warrantabilityAdminActionResponseSchema
>
