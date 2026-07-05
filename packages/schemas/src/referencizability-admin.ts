import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const referencizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type ReferencizabilityAdminDomain = z.infer<typeof referencizabilityAdminDomainSchema>

export const referencizabilityAdminRecordSchema = z.object({
  domain: referencizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ReferencizabilityAdminRecord = z.infer<typeof referencizabilityAdminRecordSchema>

export const referencizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  referencizabilityPercent: z.number().min(0).max(100),
})
export type ReferencizabilityAdminStats = z.infer<typeof referencizabilityAdminStatsSchema>

export const referencizabilityAdminActionSchema = z.enum(['refresh_referencizability_summary'])
export type ReferencizabilityAdminAction = z.infer<typeof referencizabilityAdminActionSchema>

export const referencizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(referencizabilityAdminRecordSchema),
  stats: referencizabilityAdminStatsSchema,
  availableActions: z.array(referencizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ReferencizabilityAdminSummaryResponse = z.infer<
  typeof referencizabilityAdminSummaryResponseSchema
>

export const referencizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: referencizabilityAdminActionSchema,
})
export type ReferencizabilityAdminActionRequest = z.infer<
  typeof referencizabilityAdminActionRequestSchema
>

export const referencizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: referencizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: referencizabilityAdminStatsSchema.optional(),
})
export type ReferencizabilityAdminActionResponse = z.infer<
  typeof referencizabilityAdminActionResponseSchema
>
