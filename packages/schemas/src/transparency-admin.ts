import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const transparencyAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'run_workflows',
  'billing_notifications',
])
export type TransparencyAdminDomain = z.infer<
  typeof transparencyAdminDomainSchema
>

export const transparencyAdminRecordSchema = z.object({
  domain: transparencyAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TransparencyAdminRecord = z.infer<
  typeof transparencyAdminRecordSchema
>

export const transparencyAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  transparencyPercent: z.number().min(0).max(100),
})
export type TransparencyAdminStats = z.infer<
  typeof transparencyAdminStatsSchema
>

export const transparencyAdminActionSchema = z.enum([
  'refresh_transparency_summary',
])
export type TransparencyAdminAction = z.infer<
  typeof transparencyAdminActionSchema
>

export const transparencyAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(transparencyAdminRecordSchema),
  stats: transparencyAdminStatsSchema,
  availableActions: z.array(transparencyAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TransparencyAdminSummaryResponse = z.infer<
  typeof transparencyAdminSummaryResponseSchema
>

export const transparencyAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transparencyAdminActionSchema,
})
export type TransparencyAdminActionRequest = z.infer<
  typeof transparencyAdminActionRequestSchema
>

export const transparencyAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transparencyAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: transparencyAdminStatsSchema.optional(),
})
export type TransparencyAdminActionResponse = z.infer<
  typeof transparencyAdminActionResponseSchema
>
