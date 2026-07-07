import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const accesscontrolizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'idempotency_keys',
  'usage_events',
])
export type AccesscontrolizabilityAdminDomain = z.infer<typeof accesscontrolizabilityAdminDomainSchema>

export const accesscontrolizabilityAdminRecordSchema = z.object({
  domain: accesscontrolizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AccesscontrolizabilityAdminRecord = z.infer<typeof accesscontrolizabilityAdminRecordSchema>

export const accesscontrolizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  accesscontrolizabilityPercent: z.number().min(0).max(100),
})
export type AccesscontrolizabilityAdminStats = z.infer<typeof accesscontrolizabilityAdminStatsSchema>

export const accesscontrolizabilityAdminActionSchema = z.enum(['refresh_accesscontrolizability_summary'])
export type AccesscontrolizabilityAdminAction = z.infer<typeof accesscontrolizabilityAdminActionSchema>

export const accesscontrolizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(accesscontrolizabilityAdminRecordSchema),
  stats: accesscontrolizabilityAdminStatsSchema,
  availableActions: z.array(accesscontrolizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AccesscontrolizabilityAdminSummaryResponse = z.infer<
  typeof accesscontrolizabilityAdminSummaryResponseSchema
>

export const accesscontrolizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accesscontrolizabilityAdminActionSchema,
})
export type AccesscontrolizabilityAdminActionRequest = z.infer<
  typeof accesscontrolizabilityAdminActionRequestSchema
>

export const accesscontrolizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: accesscontrolizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: accesscontrolizabilityAdminStatsSchema.optional(),
})
export type AccesscontrolizabilityAdminActionResponse = z.infer<
  typeof accesscontrolizabilityAdminActionResponseSchema
>
