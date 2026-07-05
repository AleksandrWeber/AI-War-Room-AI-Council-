import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const thesaurusizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ThesaurusizabilityAdminDomain = z.infer<typeof thesaurusizabilityAdminDomainSchema>

export const thesaurusizabilityAdminRecordSchema = z.object({
  domain: thesaurusizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ThesaurusizabilityAdminRecord = z.infer<typeof thesaurusizabilityAdminRecordSchema>

export const thesaurusizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  thesaurusizabilityPercent: z.number().min(0).max(100),
})
export type ThesaurusizabilityAdminStats = z.infer<typeof thesaurusizabilityAdminStatsSchema>

export const thesaurusizabilityAdminActionSchema = z.enum(['refresh_thesaurusizability_summary'])
export type ThesaurusizabilityAdminAction = z.infer<typeof thesaurusizabilityAdminActionSchema>

export const thesaurusizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(thesaurusizabilityAdminRecordSchema),
  stats: thesaurusizabilityAdminStatsSchema,
  availableActions: z.array(thesaurusizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ThesaurusizabilityAdminSummaryResponse = z.infer<
  typeof thesaurusizabilityAdminSummaryResponseSchema
>

export const thesaurusizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: thesaurusizabilityAdminActionSchema,
})
export type ThesaurusizabilityAdminActionRequest = z.infer<
  typeof thesaurusizabilityAdminActionRequestSchema
>

export const thesaurusizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: thesaurusizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: thesaurusizabilityAdminStatsSchema.optional(),
})
export type ThesaurusizabilityAdminActionResponse = z.infer<
  typeof thesaurusizabilityAdminActionResponseSchema
>
