import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const sustainizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'model_health_events',
  'billing_records',
])
export type SustainizabilityAdminDomain = z.infer<typeof sustainizabilityAdminDomainSchema>

export const sustainizabilityAdminRecordSchema = z.object({
  domain: sustainizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SustainizabilityAdminRecord = z.infer<typeof sustainizabilityAdminRecordSchema>

export const sustainizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  sustainizabilityPercent: z.number().min(0).max(100),
})
export type SustainizabilityAdminStats = z.infer<typeof sustainizabilityAdminStatsSchema>

export const sustainizabilityAdminActionSchema = z.enum(['refresh_sustainizability_summary'])
export type SustainizabilityAdminAction = z.infer<typeof sustainizabilityAdminActionSchema>

export const sustainizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(sustainizabilityAdminRecordSchema),
  stats: sustainizabilityAdminStatsSchema,
  availableActions: z.array(sustainizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SustainizabilityAdminSummaryResponse = z.infer<
  typeof sustainizabilityAdminSummaryResponseSchema
>

export const sustainizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sustainizabilityAdminActionSchema,
})
export type SustainizabilityAdminActionRequest = z.infer<
  typeof sustainizabilityAdminActionRequestSchema
>

export const sustainizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sustainizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: sustainizabilityAdminStatsSchema.optional(),
})
export type SustainizabilityAdminActionResponse = z.infer<
  typeof sustainizabilityAdminActionResponseSchema
>
