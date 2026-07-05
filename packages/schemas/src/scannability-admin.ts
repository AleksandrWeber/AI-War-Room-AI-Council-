import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const scannabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ScannabilityAdminDomain = z.infer<typeof scannabilityAdminDomainSchema>

export const scannabilityAdminRecordSchema = z.object({
  domain: scannabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ScannabilityAdminRecord = z.infer<typeof scannabilityAdminRecordSchema>

export const scannabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  scannabilityPercent: z.number().min(0).max(100),
})
export type ScannabilityAdminStats = z.infer<typeof scannabilityAdminStatsSchema>

export const scannabilityAdminActionSchema = z.enum(['refresh_scannability_summary'])
export type ScannabilityAdminAction = z.infer<typeof scannabilityAdminActionSchema>

export const scannabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(scannabilityAdminRecordSchema),
  stats: scannabilityAdminStatsSchema,
  availableActions: z.array(scannabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ScannabilityAdminSummaryResponse = z.infer<
  typeof scannabilityAdminSummaryResponseSchema
>

export const scannabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scannabilityAdminActionSchema,
})
export type ScannabilityAdminActionRequest = z.infer<
  typeof scannabilityAdminActionRequestSchema
>

export const scannabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scannabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: scannabilityAdminStatsSchema.optional(),
})
export type ScannabilityAdminActionResponse = z.infer<
  typeof scannabilityAdminActionResponseSchema
>
