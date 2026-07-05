import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const acceptabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'billing_invoices',
])
export type AcceptabilityAdminDomain = z.infer<typeof acceptabilityAdminDomainSchema>

export const acceptabilityAdminRecordSchema = z.object({
  domain: acceptabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type AcceptabilityAdminRecord = z.infer<typeof acceptabilityAdminRecordSchema>

export const acceptabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  acceptabilityPercent: z.number().min(0).max(100),
})
export type AcceptabilityAdminStats = z.infer<typeof acceptabilityAdminStatsSchema>

export const acceptabilityAdminActionSchema = z.enum(['refresh_acceptability_summary'])
export type AcceptabilityAdminAction = z.infer<typeof acceptabilityAdminActionSchema>

export const acceptabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(acceptabilityAdminRecordSchema),
  stats: acceptabilityAdminStatsSchema,
  availableActions: z.array(acceptabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type AcceptabilityAdminSummaryResponse = z.infer<
  typeof acceptabilityAdminSummaryResponseSchema
>

export const acceptabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: acceptabilityAdminActionSchema,
})
export type AcceptabilityAdminActionRequest = z.infer<
  typeof acceptabilityAdminActionRequestSchema
>

export const acceptabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: acceptabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: acceptabilityAdminStatsSchema.optional(),
})
export type AcceptabilityAdminActionResponse = z.infer<
  typeof acceptabilityAdminActionResponseSchema
>
