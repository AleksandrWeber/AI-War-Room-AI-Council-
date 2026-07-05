import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const retrievabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'shield_scans',
  'idempotency_keys',
])
export type RetrievabilityAdminDomain = z.infer<typeof retrievabilityAdminDomainSchema>

export const retrievabilityAdminRecordSchema = z.object({
  domain: retrievabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RetrievabilityAdminRecord = z.infer<typeof retrievabilityAdminRecordSchema>

export const retrievabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  retrievabilityPercent: z.number().min(0).max(100),
})
export type RetrievabilityAdminStats = z.infer<typeof retrievabilityAdminStatsSchema>

export const retrievabilityAdminActionSchema = z.enum(['refresh_retrievability_summary'])
export type RetrievabilityAdminAction = z.infer<typeof retrievabilityAdminActionSchema>

export const retrievabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(retrievabilityAdminRecordSchema),
  stats: retrievabilityAdminStatsSchema,
  availableActions: z.array(retrievabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RetrievabilityAdminSummaryResponse = z.infer<
  typeof retrievabilityAdminSummaryResponseSchema
>

export const retrievabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retrievabilityAdminActionSchema,
})
export type RetrievabilityAdminActionRequest = z.infer<
  typeof retrievabilityAdminActionRequestSchema
>

export const retrievabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: retrievabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: retrievabilityAdminStatsSchema.optional(),
})
export type RetrievabilityAdminActionResponse = z.infer<
  typeof retrievabilityAdminActionResponseSchema
>
