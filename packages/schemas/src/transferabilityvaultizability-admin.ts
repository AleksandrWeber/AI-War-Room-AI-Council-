import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const transferabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type TransferabilityvaultizabilityAdminDomain = z.infer<typeof transferabilityvaultizabilityAdminDomainSchema>

export const transferabilityvaultizabilityAdminRecordSchema = z.object({
  domain: transferabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TransferabilityvaultizabilityAdminRecord = z.infer<typeof transferabilityvaultizabilityAdminRecordSchema>

export const transferabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  transferabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type TransferabilityvaultizabilityAdminStats = z.infer<typeof transferabilityvaultizabilityAdminStatsSchema>

export const transferabilityvaultizabilityAdminActionSchema = z.enum(['refresh_transferabilityvaultizability_summary'])
export type TransferabilityvaultizabilityAdminAction = z.infer<typeof transferabilityvaultizabilityAdminActionSchema>

export const transferabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(transferabilityvaultizabilityAdminRecordSchema),
  stats: transferabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(transferabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TransferabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof transferabilityvaultizabilityAdminSummaryResponseSchema
>

export const transferabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transferabilityvaultizabilityAdminActionSchema,
})
export type TransferabilityvaultizabilityAdminActionRequest = z.infer<
  typeof transferabilityvaultizabilityAdminActionRequestSchema
>

export const transferabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transferabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: transferabilityvaultizabilityAdminStatsSchema.optional(),
})
export type TransferabilityvaultizabilityAdminActionResponse = z.infer<
  typeof transferabilityvaultizabilityAdminActionResponseSchema
>
