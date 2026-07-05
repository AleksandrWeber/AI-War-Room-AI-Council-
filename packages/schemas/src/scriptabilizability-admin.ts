import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const scriptabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ScriptabilizabilityAdminDomain = z.infer<typeof scriptabilizabilityAdminDomainSchema>

export const scriptabilizabilityAdminRecordSchema = z.object({
  domain: scriptabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ScriptabilizabilityAdminRecord = z.infer<typeof scriptabilizabilityAdminRecordSchema>

export const scriptabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  scriptabilizabilityPercent: z.number().min(0).max(100),
})
export type ScriptabilizabilityAdminStats = z.infer<typeof scriptabilizabilityAdminStatsSchema>

export const scriptabilizabilityAdminActionSchema = z.enum(['refresh_scriptabilizability_summary'])
export type ScriptabilizabilityAdminAction = z.infer<typeof scriptabilizabilityAdminActionSchema>

export const scriptabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(scriptabilizabilityAdminRecordSchema),
  stats: scriptabilizabilityAdminStatsSchema,
  availableActions: z.array(scriptabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ScriptabilizabilityAdminSummaryResponse = z.infer<
  typeof scriptabilizabilityAdminSummaryResponseSchema
>

export const scriptabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scriptabilizabilityAdminActionSchema,
})
export type ScriptabilizabilityAdminActionRequest = z.infer<
  typeof scriptabilizabilityAdminActionRequestSchema
>

export const scriptabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scriptabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: scriptabilizabilityAdminStatsSchema.optional(),
})
export type ScriptabilizabilityAdminActionResponse = z.infer<
  typeof scriptabilizabilityAdminActionResponseSchema
>
