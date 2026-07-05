import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const coordinationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type CoordinationizabilityAdminDomain = z.infer<typeof coordinationizabilityAdminDomainSchema>

export const coordinationizabilityAdminRecordSchema = z.object({
  domain: coordinationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CoordinationizabilityAdminRecord = z.infer<typeof coordinationizabilityAdminRecordSchema>

export const coordinationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  coordinationizabilityPercent: z.number().min(0).max(100),
})
export type CoordinationizabilityAdminStats = z.infer<typeof coordinationizabilityAdminStatsSchema>

export const coordinationizabilityAdminActionSchema = z.enum(['refresh_coordinationizability_summary'])
export type CoordinationizabilityAdminAction = z.infer<typeof coordinationizabilityAdminActionSchema>

export const coordinationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(coordinationizabilityAdminRecordSchema),
  stats: coordinationizabilityAdminStatsSchema,
  availableActions: z.array(coordinationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CoordinationizabilityAdminSummaryResponse = z.infer<
  typeof coordinationizabilityAdminSummaryResponseSchema
>

export const coordinationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: coordinationizabilityAdminActionSchema,
})
export type CoordinationizabilityAdminActionRequest = z.infer<
  typeof coordinationizabilityAdminActionRequestSchema
>

export const coordinationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: coordinationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: coordinationizabilityAdminStatsSchema.optional(),
})
export type CoordinationizabilityAdminActionResponse = z.infer<
  typeof coordinationizabilityAdminActionResponseSchema
>
