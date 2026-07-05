import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const discernibilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'moderator_syntheses',
  'agent_outputs',
])
export type DiscernibilityAdminDomain = z.infer<typeof discernibilityAdminDomainSchema>

export const discernibilityAdminRecordSchema = z.object({
  domain: discernibilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DiscernibilityAdminRecord = z.infer<typeof discernibilityAdminRecordSchema>

export const discernibilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  discernibilityPercent: z.number().min(0).max(100),
})
export type DiscernibilityAdminStats = z.infer<typeof discernibilityAdminStatsSchema>

export const discernibilityAdminActionSchema = z.enum(['refresh_discernibility_summary'])
export type DiscernibilityAdminAction = z.infer<typeof discernibilityAdminActionSchema>

export const discernibilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(discernibilityAdminRecordSchema),
  stats: discernibilityAdminStatsSchema,
  availableActions: z.array(discernibilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DiscernibilityAdminSummaryResponse = z.infer<
  typeof discernibilityAdminSummaryResponseSchema
>

export const discernibilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discernibilityAdminActionSchema,
})
export type DiscernibilityAdminActionRequest = z.infer<
  typeof discernibilityAdminActionRequestSchema
>

export const discernibilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: discernibilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: discernibilityAdminStatsSchema.optional(),
})
export type DiscernibilityAdminActionResponse = z.infer<
  typeof discernibilityAdminActionResponseSchema
>
