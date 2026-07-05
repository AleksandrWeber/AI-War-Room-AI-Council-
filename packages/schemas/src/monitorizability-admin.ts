import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const monitorizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type MonitorizabilityAdminDomain = z.infer<typeof monitorizabilityAdminDomainSchema>

export const monitorizabilityAdminRecordSchema = z.object({
  domain: monitorizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MonitorizabilityAdminRecord = z.infer<typeof monitorizabilityAdminRecordSchema>

export const monitorizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  monitorizabilityPercent: z.number().min(0).max(100),
})
export type MonitorizabilityAdminStats = z.infer<typeof monitorizabilityAdminStatsSchema>

export const monitorizabilityAdminActionSchema = z.enum(['refresh_monitorizability_summary'])
export type MonitorizabilityAdminAction = z.infer<typeof monitorizabilityAdminActionSchema>

export const monitorizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(monitorizabilityAdminRecordSchema),
  stats: monitorizabilityAdminStatsSchema,
  availableActions: z.array(monitorizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MonitorizabilityAdminSummaryResponse = z.infer<
  typeof monitorizabilityAdminSummaryResponseSchema
>

export const monitorizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: monitorizabilityAdminActionSchema,
})
export type MonitorizabilityAdminActionRequest = z.infer<
  typeof monitorizabilityAdminActionRequestSchema
>

export const monitorizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: monitorizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: monitorizabilityAdminStatsSchema.optional(),
})
export type MonitorizabilityAdminActionResponse = z.infer<
  typeof monitorizabilityAdminActionResponseSchema
>
