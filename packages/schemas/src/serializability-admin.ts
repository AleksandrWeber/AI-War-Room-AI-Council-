import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const serializabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type SerializabilityAdminDomain = z.infer<typeof serializabilityAdminDomainSchema>

export const serializabilityAdminRecordSchema = z.object({
  domain: serializabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SerializabilityAdminRecord = z.infer<typeof serializabilityAdminRecordSchema>

export const serializabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  serializabilityPercent: z.number().min(0).max(100),
})
export type SerializabilityAdminStats = z.infer<typeof serializabilityAdminStatsSchema>

export const serializabilityAdminActionSchema = z.enum(['refresh_serializability_summary'])
export type SerializabilityAdminAction = z.infer<typeof serializabilityAdminActionSchema>

export const serializabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(serializabilityAdminRecordSchema),
  stats: serializabilityAdminStatsSchema,
  availableActions: z.array(serializabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SerializabilityAdminSummaryResponse = z.infer<
  typeof serializabilityAdminSummaryResponseSchema
>

export const serializabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: serializabilityAdminActionSchema,
})
export type SerializabilityAdminActionRequest = z.infer<
  typeof serializabilityAdminActionRequestSchema
>

export const serializabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: serializabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: serializabilityAdminStatsSchema.optional(),
})
export type SerializabilityAdminActionResponse = z.infer<
  typeof serializabilityAdminActionResponseSchema
>
