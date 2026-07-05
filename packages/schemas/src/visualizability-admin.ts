import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const visualizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_registry_entries',
  'model_health_events',
])
export type VisualizabilityAdminDomain = z.infer<typeof visualizabilityAdminDomainSchema>

export const visualizabilityAdminRecordSchema = z.object({
  domain: visualizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type VisualizabilityAdminRecord = z.infer<typeof visualizabilityAdminRecordSchema>

export const visualizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  visualizabilityPercent: z.number().min(0).max(100),
})
export type VisualizabilityAdminStats = z.infer<typeof visualizabilityAdminStatsSchema>

export const visualizabilityAdminActionSchema = z.enum(['refresh_visualizability_summary'])
export type VisualizabilityAdminAction = z.infer<typeof visualizabilityAdminActionSchema>

export const visualizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(visualizabilityAdminRecordSchema),
  stats: visualizabilityAdminStatsSchema,
  availableActions: z.array(visualizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type VisualizabilityAdminSummaryResponse = z.infer<
  typeof visualizabilityAdminSummaryResponseSchema
>

export const visualizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: visualizabilityAdminActionSchema,
})
export type VisualizabilityAdminActionRequest = z.infer<
  typeof visualizabilityAdminActionRequestSchema
>

export const visualizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: visualizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: visualizabilityAdminStatsSchema.optional(),
})
export type VisualizabilityAdminActionResponse = z.infer<
  typeof visualizabilityAdminActionResponseSchema
>
