import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const articulabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'artifacts',
  'run_workflows',
])
export type ArticulabilityAdminDomain = z.infer<typeof articulabilityAdminDomainSchema>

export const articulabilityAdminRecordSchema = z.object({
  domain: articulabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ArticulabilityAdminRecord = z.infer<typeof articulabilityAdminRecordSchema>

export const articulabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  articulabilityPercent: z.number().min(0).max(100),
})
export type ArticulabilityAdminStats = z.infer<typeof articulabilityAdminStatsSchema>

export const articulabilityAdminActionSchema = z.enum(['refresh_articulability_summary'])
export type ArticulabilityAdminAction = z.infer<typeof articulabilityAdminActionSchema>

export const articulabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(articulabilityAdminRecordSchema),
  stats: articulabilityAdminStatsSchema,
  availableActions: z.array(articulabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ArticulabilityAdminSummaryResponse = z.infer<
  typeof articulabilityAdminSummaryResponseSchema
>

export const articulabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: articulabilityAdminActionSchema,
})
export type ArticulabilityAdminActionRequest = z.infer<
  typeof articulabilityAdminActionRequestSchema
>

export const articulabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: articulabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: articulabilityAdminStatsSchema.optional(),
})
export type ArticulabilityAdminActionResponse = z.infer<
  typeof articulabilityAdminActionResponseSchema
>
