import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const compatibilizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_webhook_events',
  'billing_records',
])
export type CompatibilizabilityAdminDomain = z.infer<typeof compatibilizabilityAdminDomainSchema>

export const compatibilizabilityAdminRecordSchema = z.object({
  domain: compatibilizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type CompatibilizabilityAdminRecord = z.infer<typeof compatibilizabilityAdminRecordSchema>

export const compatibilizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  compatibilizabilityPercent: z.number().min(0).max(100),
})
export type CompatibilizabilityAdminStats = z.infer<typeof compatibilizabilityAdminStatsSchema>

export const compatibilizabilityAdminActionSchema = z.enum(['refresh_compatibilizability_summary'])
export type CompatibilizabilityAdminAction = z.infer<typeof compatibilizabilityAdminActionSchema>

export const compatibilizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(compatibilizabilityAdminRecordSchema),
  stats: compatibilizabilityAdminStatsSchema,
  availableActions: z.array(compatibilizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type CompatibilizabilityAdminSummaryResponse = z.infer<
  typeof compatibilizabilityAdminSummaryResponseSchema
>

export const compatibilizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compatibilizabilityAdminActionSchema,
})
export type CompatibilizabilityAdminActionRequest = z.infer<
  typeof compatibilizabilityAdminActionRequestSchema
>

export const compatibilizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: compatibilizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: compatibilizabilityAdminStatsSchema.optional(),
})
export type CompatibilizabilityAdminActionResponse = z.infer<
  typeof compatibilizabilityAdminActionResponseSchema
>
