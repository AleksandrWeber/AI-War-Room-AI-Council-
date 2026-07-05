import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const defensibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_reviews',
  'artifacts',
])
export type DefensibilityAdminDomain = z.infer<typeof defensibilityAdminDomainSchema>

export const defensibilityAdminRecordSchema = z.object({
  domain: defensibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DefensibilityAdminRecord = z.infer<typeof defensibilityAdminRecordSchema>

export const defensibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  defensibilityPercent: z.number().min(0).max(100),
})
export type DefensibilityAdminStats = z.infer<typeof defensibilityAdminStatsSchema>

export const defensibilityAdminActionSchema = z.enum(['refresh_defensibility_summary'])
export type DefensibilityAdminAction = z.infer<typeof defensibilityAdminActionSchema>

export const defensibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(defensibilityAdminRecordSchema),
  stats: defensibilityAdminStatsSchema,
  availableActions: z.array(defensibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DefensibilityAdminSummaryResponse = z.infer<
  typeof defensibilityAdminSummaryResponseSchema
>

export const defensibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: defensibilityAdminActionSchema,
})
export type DefensibilityAdminActionRequest = z.infer<
  typeof defensibilityAdminActionRequestSchema
>

export const defensibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: defensibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: defensibilityAdminStatsSchema.optional(),
})
export type DefensibilityAdminActionResponse = z.infer<
  typeof defensibilityAdminActionResponseSchema
>
