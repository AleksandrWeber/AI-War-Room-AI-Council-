import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const interchangeabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type InterchangeabilityvaultizabilityAdminDomain = z.infer<typeof interchangeabilityvaultizabilityAdminDomainSchema>

export const interchangeabilityvaultizabilityAdminRecordSchema = z.object({
  domain: interchangeabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InterchangeabilityvaultizabilityAdminRecord = z.infer<typeof interchangeabilityvaultizabilityAdminRecordSchema>

export const interchangeabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  interchangeabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type InterchangeabilityvaultizabilityAdminStats = z.infer<typeof interchangeabilityvaultizabilityAdminStatsSchema>

export const interchangeabilityvaultizabilityAdminActionSchema = z.enum(['refresh_interchangeabilityvaultizability_summary'])
export type InterchangeabilityvaultizabilityAdminAction = z.infer<typeof interchangeabilityvaultizabilityAdminActionSchema>

export const interchangeabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(interchangeabilityvaultizabilityAdminRecordSchema),
  stats: interchangeabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(interchangeabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InterchangeabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof interchangeabilityvaultizabilityAdminSummaryResponseSchema
>

export const interchangeabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interchangeabilityvaultizabilityAdminActionSchema,
})
export type InterchangeabilityvaultizabilityAdminActionRequest = z.infer<
  typeof interchangeabilityvaultizabilityAdminActionRequestSchema
>

export const interchangeabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: interchangeabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: interchangeabilityvaultizabilityAdminStatsSchema.optional(),
})
export type InterchangeabilityvaultizabilityAdminActionResponse = z.infer<
  typeof interchangeabilityvaultizabilityAdminActionResponseSchema
>
