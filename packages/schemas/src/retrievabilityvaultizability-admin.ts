import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const retrievabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type RetrievabilityvaultizabilityAdminDomain = z.infer<typeof retrievabilityvaultizabilityAdminDomainSchema>

export const retrievabilityvaultizabilityAdminRecordSchema = z.object({
  domain: retrievabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RetrievabilityvaultizabilityAdminRecord = z.infer<typeof retrievabilityvaultizabilityAdminRecordSchema>

export const retrievabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  retrievabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type RetrievabilityvaultizabilityAdminStats = z.infer<typeof retrievabilityvaultizabilityAdminStatsSchema>

export const retrievabilityvaultizabilityAdminActionSchema = z.enum(['refresh_retrievabilityvaultizability_summary'])
export type RetrievabilityvaultizabilityAdminAction = z.infer<typeof retrievabilityvaultizabilityAdminActionSchema>

export const retrievabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(retrievabilityvaultizabilityAdminRecordSchema),
  stats: retrievabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(retrievabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RetrievabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof retrievabilityvaultizabilityAdminSummaryResponseSchema
>

export const retrievabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retrievabilityvaultizabilityAdminActionSchema,
})
export type RetrievabilityvaultizabilityAdminActionRequest = z.infer<
  typeof retrievabilityvaultizabilityAdminActionRequestSchema
>

export const retrievabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retrievabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: retrievabilityvaultizabilityAdminStatsSchema.optional(),
})
export type RetrievabilityvaultizabilityAdminActionResponse = z.infer<
  typeof retrievabilityvaultizabilityAdminActionResponseSchema
>
