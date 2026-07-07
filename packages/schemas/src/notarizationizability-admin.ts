import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const notarizationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type NotarizationizabilityAdminDomain = z.infer<typeof notarizationizabilityAdminDomainSchema>

export const notarizationizabilityAdminRecordSchema = z.object({
  domain: notarizationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NotarizationizabilityAdminRecord = z.infer<typeof notarizationizabilityAdminRecordSchema>

export const notarizationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  notarizationizabilityPercent: z.number().min(0).max(100),
})
export type NotarizationizabilityAdminStats = z.infer<typeof notarizationizabilityAdminStatsSchema>

export const notarizationizabilityAdminActionSchema = z.enum(['refresh_notarizationizability_summary'])
export type NotarizationizabilityAdminAction = z.infer<typeof notarizationizabilityAdminActionSchema>

export const notarizationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(notarizationizabilityAdminRecordSchema),
  stats: notarizationizabilityAdminStatsSchema,
  availableActions: z.array(notarizationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NotarizationizabilityAdminSummaryResponse = z.infer<
  typeof notarizationizabilityAdminSummaryResponseSchema
>

export const notarizationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarizationizabilityAdminActionSchema,
})
export type NotarizationizabilityAdminActionRequest = z.infer<
  typeof notarizationizabilityAdminActionRequestSchema
>

export const notarizationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: notarizationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: notarizationizabilityAdminStatsSchema.optional(),
})
export type NotarizationizabilityAdminActionResponse = z.infer<
  typeof notarizationizabilityAdminActionResponseSchema
>
