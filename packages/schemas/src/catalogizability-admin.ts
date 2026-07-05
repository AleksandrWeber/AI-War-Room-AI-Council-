import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const catalogizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type CatalogizabilityAdminDomain = z.infer<typeof catalogizabilityAdminDomainSchema>

export const catalogizabilityAdminRecordSchema = z.object({
  domain: catalogizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CatalogizabilityAdminRecord = z.infer<typeof catalogizabilityAdminRecordSchema>

export const catalogizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  catalogizabilityPercent: z.number().min(0).max(100),
})
export type CatalogizabilityAdminStats = z.infer<typeof catalogizabilityAdminStatsSchema>

export const catalogizabilityAdminActionSchema = z.enum(['refresh_catalogizability_summary'])
export type CatalogizabilityAdminAction = z.infer<typeof catalogizabilityAdminActionSchema>

export const catalogizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(catalogizabilityAdminRecordSchema),
  stats: catalogizabilityAdminStatsSchema,
  availableActions: z.array(catalogizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CatalogizabilityAdminSummaryResponse = z.infer<
  typeof catalogizabilityAdminSummaryResponseSchema
>

export const catalogizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: catalogizabilityAdminActionSchema,
})
export type CatalogizabilityAdminActionRequest = z.infer<
  typeof catalogizabilityAdminActionRequestSchema
>

export const catalogizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: catalogizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: catalogizabilityAdminStatsSchema.optional(),
})
export type CatalogizabilityAdminActionResponse = z.infer<
  typeof catalogizabilityAdminActionResponseSchema
>
