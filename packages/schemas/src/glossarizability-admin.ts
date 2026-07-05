import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const glossarizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type GlossarizabilityAdminDomain = z.infer<typeof glossarizabilityAdminDomainSchema>

export const glossarizabilityAdminRecordSchema = z.object({
  domain: glossarizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type GlossarizabilityAdminRecord = z.infer<typeof glossarizabilityAdminRecordSchema>

export const glossarizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  glossarizabilityPercent: z.number().min(0).max(100),
})
export type GlossarizabilityAdminStats = z.infer<typeof glossarizabilityAdminStatsSchema>

export const glossarizabilityAdminActionSchema = z.enum(['refresh_glossarizability_summary'])
export type GlossarizabilityAdminAction = z.infer<typeof glossarizabilityAdminActionSchema>

export const glossarizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(glossarizabilityAdminRecordSchema),
  stats: glossarizabilityAdminStatsSchema,
  availableActions: z.array(glossarizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type GlossarizabilityAdminSummaryResponse = z.infer<
  typeof glossarizabilityAdminSummaryResponseSchema
>

export const glossarizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: glossarizabilityAdminActionSchema,
})
export type GlossarizabilityAdminActionRequest = z.infer<
  typeof glossarizabilityAdminActionRequestSchema
>

export const glossarizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: glossarizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: glossarizabilityAdminStatsSchema.optional(),
})
export type GlossarizabilityAdminActionResponse = z.infer<
  typeof glossarizabilityAdminActionResponseSchema
>
