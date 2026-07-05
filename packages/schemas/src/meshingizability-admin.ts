import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const meshingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type MeshingizabilityAdminDomain = z.infer<typeof meshingizabilityAdminDomainSchema>

export const meshingizabilityAdminRecordSchema = z.object({
  domain: meshingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type MeshingizabilityAdminRecord = z.infer<typeof meshingizabilityAdminRecordSchema>

export const meshingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  meshingizabilityPercent: z.number().min(0).max(100),
})
export type MeshingizabilityAdminStats = z.infer<typeof meshingizabilityAdminStatsSchema>

export const meshingizabilityAdminActionSchema = z.enum(['refresh_meshingizability_summary'])
export type MeshingizabilityAdminAction = z.infer<typeof meshingizabilityAdminActionSchema>

export const meshingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(meshingizabilityAdminRecordSchema),
  stats: meshingizabilityAdminStatsSchema,
  availableActions: z.array(meshingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type MeshingizabilityAdminSummaryResponse = z.infer<
  typeof meshingizabilityAdminSummaryResponseSchema
>

export const meshingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: meshingizabilityAdminActionSchema,
})
export type MeshingizabilityAdminActionRequest = z.infer<
  typeof meshingizabilityAdminActionRequestSchema
>

export const meshingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: meshingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: meshingizabilityAdminStatsSchema.optional(),
})
export type MeshingizabilityAdminActionResponse = z.infer<
  typeof meshingizabilityAdminActionResponseSchema
>
