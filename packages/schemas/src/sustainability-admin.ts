import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const sustainabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'usage_events',
])
export type SustainabilityAdminDomain = z.infer<
  typeof sustainabilityAdminDomainSchema
>

export const sustainabilityAdminRecordSchema = z.object({
  domain: sustainabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type SustainabilityAdminRecord = z.infer<
  typeof sustainabilityAdminRecordSchema
>

export const sustainabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  sustainabilityPercent: z.number().min(0).max(100),
})
export type SustainabilityAdminStats = z.infer<
  typeof sustainabilityAdminStatsSchema
>

export const sustainabilityAdminActionSchema = z.enum([
  'refresh_sustainability_summary',
])
export type SustainabilityAdminAction = z.infer<
  typeof sustainabilityAdminActionSchema
>

export const sustainabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(sustainabilityAdminRecordSchema),
  stats: sustainabilityAdminStatsSchema,
  availableActions: z.array(sustainabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type SustainabilityAdminSummaryResponse = z.infer<
  typeof sustainabilityAdminSummaryResponseSchema
>

export const sustainabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sustainabilityAdminActionSchema,
})
export type SustainabilityAdminActionRequest = z.infer<
  typeof sustainabilityAdminActionRequestSchema
>

export const sustainabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: sustainabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: sustainabilityAdminStatsSchema.optional(),
})
export type SustainabilityAdminActionResponse = z.infer<
  typeof sustainabilityAdminActionResponseSchema
>
