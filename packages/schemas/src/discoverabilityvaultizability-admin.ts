import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const discoverabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type DiscoverabilityvaultizabilityAdminDomain = z.infer<typeof discoverabilityvaultizabilityAdminDomainSchema>

export const discoverabilityvaultizabilityAdminRecordSchema = z.object({
  domain: discoverabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DiscoverabilityvaultizabilityAdminRecord = z.infer<typeof discoverabilityvaultizabilityAdminRecordSchema>

export const discoverabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  discoverabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type DiscoverabilityvaultizabilityAdminStats = z.infer<typeof discoverabilityvaultizabilityAdminStatsSchema>

export const discoverabilityvaultizabilityAdminActionSchema = z.enum(['refresh_discoverabilityvaultizability_summary'])
export type DiscoverabilityvaultizabilityAdminAction = z.infer<typeof discoverabilityvaultizabilityAdminActionSchema>

export const discoverabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(discoverabilityvaultizabilityAdminRecordSchema),
  stats: discoverabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(discoverabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DiscoverabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof discoverabilityvaultizabilityAdminSummaryResponseSchema
>

export const discoverabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discoverabilityvaultizabilityAdminActionSchema,
})
export type DiscoverabilityvaultizabilityAdminActionRequest = z.infer<
  typeof discoverabilityvaultizabilityAdminActionRequestSchema
>

export const discoverabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discoverabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: discoverabilityvaultizabilityAdminStatsSchema.optional(),
})
export type DiscoverabilityvaultizabilityAdminActionResponse = z.infer<
  typeof discoverabilityvaultizabilityAdminActionResponseSchema
>
