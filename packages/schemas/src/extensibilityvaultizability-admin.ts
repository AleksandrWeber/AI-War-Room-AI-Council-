import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const extensibilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type ExtensibilityvaultizabilityAdminDomain = z.infer<typeof extensibilityvaultizabilityAdminDomainSchema>

export const extensibilityvaultizabilityAdminRecordSchema = z.object({
  domain: extensibilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ExtensibilityvaultizabilityAdminRecord = z.infer<typeof extensibilityvaultizabilityAdminRecordSchema>

export const extensibilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  extensibilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ExtensibilityvaultizabilityAdminStats = z.infer<typeof extensibilityvaultizabilityAdminStatsSchema>

export const extensibilityvaultizabilityAdminActionSchema = z.enum(['refresh_extensibilityvaultizability_summary'])
export type ExtensibilityvaultizabilityAdminAction = z.infer<typeof extensibilityvaultizabilityAdminActionSchema>

export const extensibilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(extensibilityvaultizabilityAdminRecordSchema),
  stats: extensibilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(extensibilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ExtensibilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof extensibilityvaultizabilityAdminSummaryResponseSchema
>

export const extensibilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extensibilityvaultizabilityAdminActionSchema,
})
export type ExtensibilityvaultizabilityAdminActionRequest = z.infer<
  typeof extensibilityvaultizabilityAdminActionRequestSchema
>

export const extensibilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: extensibilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: extensibilityvaultizabilityAdminStatsSchema.optional(),
})
export type ExtensibilityvaultizabilityAdminActionResponse = z.infer<
  typeof extensibilityvaultizabilityAdminActionResponseSchema
>
