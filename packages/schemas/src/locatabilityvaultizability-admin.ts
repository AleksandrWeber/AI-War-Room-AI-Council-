import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const locatabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_memberships',
  'usage_events',
])
export type LocatabilityvaultizabilityAdminDomain = z.infer<typeof locatabilityvaultizabilityAdminDomainSchema>

export const locatabilityvaultizabilityAdminRecordSchema = z.object({
  domain: locatabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type LocatabilityvaultizabilityAdminRecord = z.infer<typeof locatabilityvaultizabilityAdminRecordSchema>

export const locatabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  locatabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type LocatabilityvaultizabilityAdminStats = z.infer<typeof locatabilityvaultizabilityAdminStatsSchema>

export const locatabilityvaultizabilityAdminActionSchema = z.enum(['refresh_locatabilityvaultizability_summary'])
export type LocatabilityvaultizabilityAdminAction = z.infer<typeof locatabilityvaultizabilityAdminActionSchema>

export const locatabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(locatabilityvaultizabilityAdminRecordSchema),
  stats: locatabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(locatabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type LocatabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof locatabilityvaultizabilityAdminSummaryResponseSchema
>

export const locatabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: locatabilityvaultizabilityAdminActionSchema,
})
export type LocatabilityvaultizabilityAdminActionRequest = z.infer<
  typeof locatabilityvaultizabilityAdminActionRequestSchema
>

export const locatabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: locatabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: locatabilityvaultizabilityAdminStatsSchema.optional(),
})
export type LocatabilityvaultizabilityAdminActionResponse = z.infer<
  typeof locatabilityvaultizabilityAdminActionResponseSchema
>
