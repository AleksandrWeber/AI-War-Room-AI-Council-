import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const taxonomizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type TaxonomizabilityAdminDomain = z.infer<typeof taxonomizabilityAdminDomainSchema>

export const taxonomizabilityAdminRecordSchema = z.object({
  domain: taxonomizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TaxonomizabilityAdminRecord = z.infer<typeof taxonomizabilityAdminRecordSchema>

export const taxonomizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  taxonomizabilityPercent: z.number().min(0).max(100),
})
export type TaxonomizabilityAdminStats = z.infer<typeof taxonomizabilityAdminStatsSchema>

export const taxonomizabilityAdminActionSchema = z.enum(['refresh_taxonomizability_summary'])
export type TaxonomizabilityAdminAction = z.infer<typeof taxonomizabilityAdminActionSchema>

export const taxonomizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(taxonomizabilityAdminRecordSchema),
  stats: taxonomizabilityAdminStatsSchema,
  availableActions: z.array(taxonomizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TaxonomizabilityAdminSummaryResponse = z.infer<
  typeof taxonomizabilityAdminSummaryResponseSchema
>

export const taxonomizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: taxonomizabilityAdminActionSchema,
})
export type TaxonomizabilityAdminActionRequest = z.infer<
  typeof taxonomizabilityAdminActionRequestSchema
>

export const taxonomizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: taxonomizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: taxonomizabilityAdminStatsSchema.optional(),
})
export type TaxonomizabilityAdminActionResponse = z.infer<
  typeof taxonomizabilityAdminActionResponseSchema
>
