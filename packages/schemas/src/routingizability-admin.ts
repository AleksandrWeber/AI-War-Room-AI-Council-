import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const routingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type RoutingizabilityAdminDomain = z.infer<typeof routingizabilityAdminDomainSchema>

export const routingizabilityAdminRecordSchema = z.object({
  domain: routingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RoutingizabilityAdminRecord = z.infer<typeof routingizabilityAdminRecordSchema>

export const routingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  routingizabilityPercent: z.number().min(0).max(100),
})
export type RoutingizabilityAdminStats = z.infer<typeof routingizabilityAdminStatsSchema>

export const routingizabilityAdminActionSchema = z.enum(['refresh_routingizability_summary'])
export type RoutingizabilityAdminAction = z.infer<typeof routingizabilityAdminActionSchema>

export const routingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(routingizabilityAdminRecordSchema),
  stats: routingizabilityAdminStatsSchema,
  availableActions: z.array(routingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RoutingizabilityAdminSummaryResponse = z.infer<
  typeof routingizabilityAdminSummaryResponseSchema
>

export const routingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: routingizabilityAdminActionSchema,
})
export type RoutingizabilityAdminActionRequest = z.infer<
  typeof routingizabilityAdminActionRequestSchema
>

export const routingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: routingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: routingizabilityAdminStatsSchema.optional(),
})
export type RoutingizabilityAdminActionResponse = z.infer<
  typeof routingizabilityAdminActionResponseSchema
>
