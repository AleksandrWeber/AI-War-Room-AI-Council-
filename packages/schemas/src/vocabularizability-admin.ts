import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const vocabularizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type VocabularizabilityAdminDomain = z.infer<typeof vocabularizabilityAdminDomainSchema>

export const vocabularizabilityAdminRecordSchema = z.object({
  domain: vocabularizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type VocabularizabilityAdminRecord = z.infer<typeof vocabularizabilityAdminRecordSchema>

export const vocabularizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  vocabularizabilityPercent: z.number().min(0).max(100),
})
export type VocabularizabilityAdminStats = z.infer<typeof vocabularizabilityAdminStatsSchema>

export const vocabularizabilityAdminActionSchema = z.enum(['refresh_vocabularizability_summary'])
export type VocabularizabilityAdminAction = z.infer<typeof vocabularizabilityAdminActionSchema>

export const vocabularizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(vocabularizabilityAdminRecordSchema),
  stats: vocabularizabilityAdminStatsSchema,
  availableActions: z.array(vocabularizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type VocabularizabilityAdminSummaryResponse = z.infer<
  typeof vocabularizabilityAdminSummaryResponseSchema
>

export const vocabularizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: vocabularizabilityAdminActionSchema,
})
export type VocabularizabilityAdminActionRequest = z.infer<
  typeof vocabularizabilityAdminActionRequestSchema
>

export const vocabularizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: vocabularizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: vocabularizabilityAdminStatsSchema.optional(),
})
export type VocabularizabilityAdminActionResponse = z.infer<
  typeof vocabularizabilityAdminActionResponseSchema
>
