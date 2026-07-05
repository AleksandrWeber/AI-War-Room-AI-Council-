import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const inferencizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type InferencizabilityAdminDomain = z.infer<typeof inferencizabilityAdminDomainSchema>

export const inferencizabilityAdminRecordSchema = z.object({
  domain: inferencizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type InferencizabilityAdminRecord = z.infer<typeof inferencizabilityAdminRecordSchema>

export const inferencizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  inferencizabilityPercent: z.number().min(0).max(100),
})
export type InferencizabilityAdminStats = z.infer<typeof inferencizabilityAdminStatsSchema>

export const inferencizabilityAdminActionSchema = z.enum(['refresh_inferencizability_summary'])
export type InferencizabilityAdminAction = z.infer<typeof inferencizabilityAdminActionSchema>

export const inferencizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(inferencizabilityAdminRecordSchema),
  stats: inferencizabilityAdminStatsSchema,
  availableActions: z.array(inferencizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type InferencizabilityAdminSummaryResponse = z.infer<
  typeof inferencizabilityAdminSummaryResponseSchema
>

export const inferencizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inferencizabilityAdminActionSchema,
})
export type InferencizabilityAdminActionRequest = z.infer<
  typeof inferencizabilityAdminActionRequestSchema
>

export const inferencizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: inferencizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: inferencizabilityAdminStatsSchema.optional(),
})
export type InferencizabilityAdminActionResponse = z.infer<
  typeof inferencizabilityAdminActionResponseSchema
>
