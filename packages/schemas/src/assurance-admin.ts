import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const assuranceAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_reviews',
  'artifacts',
])
export type AssuranceAdminDomain = z.infer<typeof assuranceAdminDomainSchema>

export const assuranceAdminRecordSchema = z.object({
  domain: assuranceAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AssuranceAdminRecord = z.infer<typeof assuranceAdminRecordSchema>

export const assuranceAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  assurancePercent: z.number().min(0).max(100),
})
export type AssuranceAdminStats = z.infer<typeof assuranceAdminStatsSchema>

export const assuranceAdminActionSchema = z.enum([
  'refresh_assurance_summary',
])
export type AssuranceAdminAction = z.infer<typeof assuranceAdminActionSchema>

export const assuranceAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(assuranceAdminRecordSchema),
  stats: assuranceAdminStatsSchema,
  availableActions: z.array(assuranceAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AssuranceAdminSummaryResponse = z.infer<
  typeof assuranceAdminSummaryResponseSchema
>

export const assuranceAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assuranceAdminActionSchema,
})
export type AssuranceAdminActionRequest = z.infer<
  typeof assuranceAdminActionRequestSchema
>

export const assuranceAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: assuranceAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: assuranceAdminStatsSchema.optional(),
})
export type AssuranceAdminActionResponse = z.infer<
  typeof assuranceAdminActionResponseSchema
>
