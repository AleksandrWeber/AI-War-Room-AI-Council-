import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const debouncizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type DebouncizabilityAdminDomain = z.infer<typeof debouncizabilityAdminDomainSchema>

export const debouncizabilityAdminRecordSchema = z.object({
  domain: debouncizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DebouncizabilityAdminRecord = z.infer<typeof debouncizabilityAdminRecordSchema>

export const debouncizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  debouncizabilityPercent: z.number().min(0).max(100),
})
export type DebouncizabilityAdminStats = z.infer<typeof debouncizabilityAdminStatsSchema>

export const debouncizabilityAdminActionSchema = z.enum(['refresh_debouncizability_summary'])
export type DebouncizabilityAdminAction = z.infer<typeof debouncizabilityAdminActionSchema>

export const debouncizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(debouncizabilityAdminRecordSchema),
  stats: debouncizabilityAdminStatsSchema,
  availableActions: z.array(debouncizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DebouncizabilityAdminSummaryResponse = z.infer<
  typeof debouncizabilityAdminSummaryResponseSchema
>

export const debouncizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: debouncizabilityAdminActionSchema,
})
export type DebouncizabilityAdminActionRequest = z.infer<
  typeof debouncizabilityAdminActionRequestSchema
>

export const debouncizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: debouncizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: debouncizabilityAdminStatsSchema.optional(),
})
export type DebouncizabilityAdminActionResponse = z.infer<
  typeof debouncizabilityAdminActionResponseSchema
>
