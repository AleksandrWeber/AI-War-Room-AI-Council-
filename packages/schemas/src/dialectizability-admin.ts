import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const dialectizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type DialectizabilityAdminDomain = z.infer<typeof dialectizabilityAdminDomainSchema>

export const dialectizabilityAdminRecordSchema = z.object({
  domain: dialectizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type DialectizabilityAdminRecord = z.infer<typeof dialectizabilityAdminRecordSchema>

export const dialectizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  dialectizabilityPercent: z.number().min(0).max(100),
})
export type DialectizabilityAdminStats = z.infer<typeof dialectizabilityAdminStatsSchema>

export const dialectizabilityAdminActionSchema = z.enum(['refresh_dialectizability_summary'])
export type DialectizabilityAdminAction = z.infer<typeof dialectizabilityAdminActionSchema>

export const dialectizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(dialectizabilityAdminRecordSchema),
  stats: dialectizabilityAdminStatsSchema,
  availableActions: z.array(dialectizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type DialectizabilityAdminSummaryResponse = z.infer<
  typeof dialectizabilityAdminSummaryResponseSchema
>

export const dialectizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dialectizabilityAdminActionSchema,
})
export type DialectizabilityAdminActionRequest = z.infer<
  typeof dialectizabilityAdminActionRequestSchema
>

export const dialectizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: dialectizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: dialectizabilityAdminStatsSchema.optional(),
})
export type DialectizabilityAdminActionResponse = z.infer<
  typeof dialectizabilityAdminActionResponseSchema
>
