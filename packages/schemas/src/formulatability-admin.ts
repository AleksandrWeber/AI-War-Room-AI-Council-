import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const formulatabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type FormulatabilityAdminDomain = z.infer<typeof formulatabilityAdminDomainSchema>

export const formulatabilityAdminRecordSchema = z.object({
  domain: formulatabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type FormulatabilityAdminRecord = z.infer<typeof formulatabilityAdminRecordSchema>

export const formulatabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  formulatabilityPercent: z.number().min(0).max(100),
})
export type FormulatabilityAdminStats = z.infer<typeof formulatabilityAdminStatsSchema>

export const formulatabilityAdminActionSchema = z.enum(['refresh_formulatability_summary'])
export type FormulatabilityAdminAction = z.infer<typeof formulatabilityAdminActionSchema>

export const formulatabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(formulatabilityAdminRecordSchema),
  stats: formulatabilityAdminStatsSchema,
  availableActions: z.array(formulatabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type FormulatabilityAdminSummaryResponse = z.infer<
  typeof formulatabilityAdminSummaryResponseSchema
>

export const formulatabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: formulatabilityAdminActionSchema,
})
export type FormulatabilityAdminActionRequest = z.infer<
  typeof formulatabilityAdminActionRequestSchema
>

export const formulatabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: formulatabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: formulatabilityAdminStatsSchema.optional(),
})
export type FormulatabilityAdminActionResponse = z.infer<
  typeof formulatabilityAdminActionResponseSchema
>
