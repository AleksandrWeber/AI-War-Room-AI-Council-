import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const calibratizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type CalibratizabilityAdminDomain = z.infer<typeof calibratizabilityAdminDomainSchema>

export const calibratizabilityAdminRecordSchema = z.object({
  domain: calibratizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CalibratizabilityAdminRecord = z.infer<typeof calibratizabilityAdminRecordSchema>

export const calibratizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  calibratizabilityPercent: z.number().min(0).max(100),
})
export type CalibratizabilityAdminStats = z.infer<typeof calibratizabilityAdminStatsSchema>

export const calibratizabilityAdminActionSchema = z.enum(['refresh_calibratizability_summary'])
export type CalibratizabilityAdminAction = z.infer<typeof calibratizabilityAdminActionSchema>

export const calibratizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(calibratizabilityAdminRecordSchema),
  stats: calibratizabilityAdminStatsSchema,
  availableActions: z.array(calibratizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CalibratizabilityAdminSummaryResponse = z.infer<
  typeof calibratizabilityAdminSummaryResponseSchema
>

export const calibratizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: calibratizabilityAdminActionSchema,
})
export type CalibratizabilityAdminActionRequest = z.infer<
  typeof calibratizabilityAdminActionRequestSchema
>

export const calibratizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: calibratizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: calibratizabilityAdminStatsSchema.optional(),
})
export type CalibratizabilityAdminActionResponse = z.infer<
  typeof calibratizabilityAdminActionResponseSchema
>
