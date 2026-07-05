import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const meshabilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type MeshabilizabilityAdminDomain = z.infer<typeof meshabilizabilityAdminDomainSchema>

export const meshabilizabilityAdminRecordSchema = z.object({
  domain: meshabilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MeshabilizabilityAdminRecord = z.infer<typeof meshabilizabilityAdminRecordSchema>

export const meshabilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  meshabilizabilityPercent: z.number().min(0).max(100),
})
export type MeshabilizabilityAdminStats = z.infer<typeof meshabilizabilityAdminStatsSchema>

export const meshabilizabilityAdminActionSchema = z.enum(['refresh_meshabilizability_summary'])
export type MeshabilizabilityAdminAction = z.infer<typeof meshabilizabilityAdminActionSchema>

export const meshabilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(meshabilizabilityAdminRecordSchema),
  stats: meshabilizabilityAdminStatsSchema,
  availableActions: z.array(meshabilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MeshabilizabilityAdminSummaryResponse = z.infer<
  typeof meshabilizabilityAdminSummaryResponseSchema
>

export const meshabilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: meshabilizabilityAdminActionSchema,
})
export type MeshabilizabilityAdminActionRequest = z.infer<
  typeof meshabilizabilityAdminActionRequestSchema
>

export const meshabilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: meshabilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: meshabilizabilityAdminStatsSchema.optional(),
})
export type MeshabilizabilityAdminActionResponse = z.infer<
  typeof meshabilizabilityAdminActionResponseSchema
>
