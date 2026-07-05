import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const scalabilityAdminDomainSchema = z.enum([
  'active_runs',
  'completed_runs',
  'usage_events',
  'workspace_memberships',
])
export type ScalabilityAdminDomain = z.infer<
  typeof scalabilityAdminDomainSchema
>

export const scalabilityAdminRecordSchema = z.object({
  domain: scalabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ScalabilityAdminRecord = z.infer<
  typeof scalabilityAdminRecordSchema
>

export const scalabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  scalabilityPercent: z.number().min(0).max(100),
})
export type ScalabilityAdminStats = z.infer<typeof scalabilityAdminStatsSchema>

export const scalabilityAdminActionSchema = z.enum([
  'refresh_scalability_summary',
])
export type ScalabilityAdminAction = z.infer<
  typeof scalabilityAdminActionSchema
>

export const scalabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(scalabilityAdminRecordSchema),
  stats: scalabilityAdminStatsSchema,
  availableActions: z.array(scalabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ScalabilityAdminSummaryResponse = z.infer<
  typeof scalabilityAdminSummaryResponseSchema
>

export const scalabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scalabilityAdminActionSchema,
})
export type ScalabilityAdminActionRequest = z.infer<
  typeof scalabilityAdminActionRequestSchema
>

export const scalabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scalabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: scalabilityAdminStatsSchema.optional(),
})
export type ScalabilityAdminActionResponse = z.infer<
  typeof scalabilityAdminActionResponseSchema
>
