import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const composabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ComposabilityvaultizabilityAdminDomain = z.infer<typeof composabilityvaultizabilityAdminDomainSchema>

export const composabilityvaultizabilityAdminRecordSchema = z.object({
  domain: composabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ComposabilityvaultizabilityAdminRecord = z.infer<typeof composabilityvaultizabilityAdminRecordSchema>

export const composabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  composabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ComposabilityvaultizabilityAdminStats = z.infer<typeof composabilityvaultizabilityAdminStatsSchema>

export const composabilityvaultizabilityAdminActionSchema = z.enum(['refresh_composabilityvaultizability_summary'])
export type ComposabilityvaultizabilityAdminAction = z.infer<typeof composabilityvaultizabilityAdminActionSchema>

export const composabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(composabilityvaultizabilityAdminRecordSchema),
  stats: composabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(composabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ComposabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof composabilityvaultizabilityAdminSummaryResponseSchema
>

export const composabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: composabilityvaultizabilityAdminActionSchema,
})
export type ComposabilityvaultizabilityAdminActionRequest = z.infer<
  typeof composabilityvaultizabilityAdminActionRequestSchema
>

export const composabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: composabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: composabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ComposabilityvaultizabilityAdminActionResponse = z.infer<
  typeof composabilityvaultizabilityAdminActionResponseSchema
>
