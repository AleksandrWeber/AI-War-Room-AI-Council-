import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const justifiabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type JustifiabilityvaultizabilityAdminDomain = z.infer<typeof justifiabilityvaultizabilityAdminDomainSchema>

export const justifiabilityvaultizabilityAdminRecordSchema = z.object({
  domain: justifiabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type JustifiabilityvaultizabilityAdminRecord = z.infer<typeof justifiabilityvaultizabilityAdminRecordSchema>

export const justifiabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  justifiabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type JustifiabilityvaultizabilityAdminStats = z.infer<typeof justifiabilityvaultizabilityAdminStatsSchema>

export const justifiabilityvaultizabilityAdminActionSchema = z.enum(['refresh_justifiabilityvaultizability_summary'])
export type JustifiabilityvaultizabilityAdminAction = z.infer<typeof justifiabilityvaultizabilityAdminActionSchema>

export const justifiabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(justifiabilityvaultizabilityAdminRecordSchema),
  stats: justifiabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(justifiabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type JustifiabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof justifiabilityvaultizabilityAdminSummaryResponseSchema
>

export const justifiabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: justifiabilityvaultizabilityAdminActionSchema,
})
export type JustifiabilityvaultizabilityAdminActionRequest = z.infer<
  typeof justifiabilityvaultizabilityAdminActionRequestSchema
>

export const justifiabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: justifiabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: justifiabilityvaultizabilityAdminStatsSchema.optional(),
})
export type JustifiabilityvaultizabilityAdminActionResponse = z.infer<
  typeof justifiabilityvaultizabilityAdminActionResponseSchema
>
