import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const decompressizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type DecompressizabilityAdminDomain = z.infer<typeof decompressizabilityAdminDomainSchema>

export const decompressizabilityAdminRecordSchema = z.object({
  domain: decompressizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DecompressizabilityAdminRecord = z.infer<typeof decompressizabilityAdminRecordSchema>

export const decompressizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  decompressizabilityPercent: z.number().min(0).max(100),
})
export type DecompressizabilityAdminStats = z.infer<typeof decompressizabilityAdminStatsSchema>

export const decompressizabilityAdminActionSchema = z.enum(['refresh_decompressizability_summary'])
export type DecompressizabilityAdminAction = z.infer<typeof decompressizabilityAdminActionSchema>

export const decompressizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(decompressizabilityAdminRecordSchema),
  stats: decompressizabilityAdminStatsSchema,
  availableActions: z.array(decompressizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DecompressizabilityAdminSummaryResponse = z.infer<
  typeof decompressizabilityAdminSummaryResponseSchema
>

export const decompressizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: decompressizabilityAdminActionSchema,
})
export type DecompressizabilityAdminActionRequest = z.infer<
  typeof decompressizabilityAdminActionRequestSchema
>

export const decompressizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: decompressizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: decompressizabilityAdminStatsSchema.optional(),
})
export type DecompressizabilityAdminActionResponse = z.infer<
  typeof decompressizabilityAdminActionResponseSchema
>
