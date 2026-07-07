import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const transparencyizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type TransparencyizabilityAdminDomain = z.infer<typeof transparencyizabilityAdminDomainSchema>

export const transparencyizabilityAdminRecordSchema = z.object({
  domain: transparencyizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TransparencyizabilityAdminRecord = z.infer<typeof transparencyizabilityAdminRecordSchema>

export const transparencyizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  transparencyizabilityPercent: z.number().min(0).max(100),
})
export type TransparencyizabilityAdminStats = z.infer<typeof transparencyizabilityAdminStatsSchema>

export const transparencyizabilityAdminActionSchema = z.enum(['refresh_transparencyizability_summary'])
export type TransparencyizabilityAdminAction = z.infer<typeof transparencyizabilityAdminActionSchema>

export const transparencyizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(transparencyizabilityAdminRecordSchema),
  stats: transparencyizabilityAdminStatsSchema,
  availableActions: z.array(transparencyizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TransparencyizabilityAdminSummaryResponse = z.infer<
  typeof transparencyizabilityAdminSummaryResponseSchema
>

export const transparencyizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transparencyizabilityAdminActionSchema,
})
export type TransparencyizabilityAdminActionRequest = z.infer<
  typeof transparencyizabilityAdminActionRequestSchema
>

export const transparencyizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transparencyizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: transparencyizabilityAdminStatsSchema.optional(),
})
export type TransparencyizabilityAdminActionResponse = z.infer<
  typeof transparencyizabilityAdminActionResponseSchema
>
