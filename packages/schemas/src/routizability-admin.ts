import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const routizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'workspace_provider_credentials',
])
export type RoutizabilityAdminDomain = z.infer<typeof routizabilityAdminDomainSchema>

export const routizabilityAdminRecordSchema = z.object({
  domain: routizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RoutizabilityAdminRecord = z.infer<typeof routizabilityAdminRecordSchema>

export const routizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  routizabilityPercent: z.number().min(0).max(100),
})
export type RoutizabilityAdminStats = z.infer<typeof routizabilityAdminStatsSchema>

export const routizabilityAdminActionSchema = z.enum(['refresh_routizability_summary'])
export type RoutizabilityAdminAction = z.infer<typeof routizabilityAdminActionSchema>

export const routizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(routizabilityAdminRecordSchema),
  stats: routizabilityAdminStatsSchema,
  availableActions: z.array(routizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RoutizabilityAdminSummaryResponse = z.infer<
  typeof routizabilityAdminSummaryResponseSchema
>

export const routizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: routizabilityAdminActionSchema,
})
export type RoutizabilityAdminActionRequest = z.infer<
  typeof routizabilityAdminActionRequestSchema
>

export const routizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: routizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: routizabilityAdminStatsSchema.optional(),
})
export type RoutizabilityAdminActionResponse = z.infer<
  typeof routizabilityAdminActionResponseSchema
>
