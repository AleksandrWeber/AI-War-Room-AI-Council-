import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const throttleizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'workspace_provider_credentials',
  'model_registry_entries',
])
export type ThrottleizabilityAdminDomain = z.infer<typeof throttleizabilityAdminDomainSchema>

export const throttleizabilityAdminRecordSchema = z.object({
  domain: throttleizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ThrottleizabilityAdminRecord = z.infer<typeof throttleizabilityAdminRecordSchema>

export const throttleizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  throttleizabilityPercent: z.number().min(0).max(100),
})
export type ThrottleizabilityAdminStats = z.infer<typeof throttleizabilityAdminStatsSchema>

export const throttleizabilityAdminActionSchema = z.enum(['refresh_throttleizability_summary'])
export type ThrottleizabilityAdminAction = z.infer<typeof throttleizabilityAdminActionSchema>

export const throttleizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(throttleizabilityAdminRecordSchema),
  stats: throttleizabilityAdminStatsSchema,
  availableActions: z.array(throttleizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ThrottleizabilityAdminSummaryResponse = z.infer<
  typeof throttleizabilityAdminSummaryResponseSchema
>

export const throttleizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: throttleizabilityAdminActionSchema,
})
export type ThrottleizabilityAdminActionRequest = z.infer<
  typeof throttleizabilityAdminActionRequestSchema
>

export const throttleizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: throttleizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: throttleizabilityAdminStatsSchema.optional(),
})
export type ThrottleizabilityAdminActionResponse = z.infer<
  typeof throttleizabilityAdminActionResponseSchema
>
