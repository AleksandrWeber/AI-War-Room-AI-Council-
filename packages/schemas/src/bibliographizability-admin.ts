import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const bibliographizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type BibliographizabilityAdminDomain = z.infer<typeof bibliographizabilityAdminDomainSchema>

export const bibliographizabilityAdminRecordSchema = z.object({
  domain: bibliographizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type BibliographizabilityAdminRecord = z.infer<typeof bibliographizabilityAdminRecordSchema>

export const bibliographizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  bibliographizabilityPercent: z.number().min(0).max(100),
})
export type BibliographizabilityAdminStats = z.infer<typeof bibliographizabilityAdminStatsSchema>

export const bibliographizabilityAdminActionSchema = z.enum(['refresh_bibliographizability_summary'])
export type BibliographizabilityAdminAction = z.infer<typeof bibliographizabilityAdminActionSchema>

export const bibliographizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(bibliographizabilityAdminRecordSchema),
  stats: bibliographizabilityAdminStatsSchema,
  availableActions: z.array(bibliographizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type BibliographizabilityAdminSummaryResponse = z.infer<
  typeof bibliographizabilityAdminSummaryResponseSchema
>

export const bibliographizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: bibliographizabilityAdminActionSchema,
})
export type BibliographizabilityAdminActionRequest = z.infer<
  typeof bibliographizabilityAdminActionRequestSchema
>

export const bibliographizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: bibliographizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: bibliographizabilityAdminStatsSchema.optional(),
})
export type BibliographizabilityAdminActionResponse = z.infer<
  typeof bibliographizabilityAdminActionResponseSchema
>
