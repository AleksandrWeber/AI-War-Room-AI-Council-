import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const transferabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_records',
  'billing_invoices',
])
export type TransferabilityAdminDomain = z.infer<typeof transferabilityAdminDomainSchema>

export const transferabilityAdminRecordSchema = z.object({
  domain: transferabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TransferabilityAdminRecord = z.infer<typeof transferabilityAdminRecordSchema>

export const transferabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  transferabilityPercent: z.number().min(0).max(100),
})
export type TransferabilityAdminStats = z.infer<typeof transferabilityAdminStatsSchema>

export const transferabilityAdminActionSchema = z.enum(['refresh_transferability_summary'])
export type TransferabilityAdminAction = z.infer<typeof transferabilityAdminActionSchema>

export const transferabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(transferabilityAdminRecordSchema),
  stats: transferabilityAdminStatsSchema,
  availableActions: z.array(transferabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TransferabilityAdminSummaryResponse = z.infer<
  typeof transferabilityAdminSummaryResponseSchema
>

export const transferabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transferabilityAdminActionSchema,
})
export type TransferabilityAdminActionRequest = z.infer<
  typeof transferabilityAdminActionRequestSchema
>

export const transferabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: transferabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: transferabilityAdminStatsSchema.optional(),
})
export type TransferabilityAdminActionResponse = z.infer<
  typeof transferabilityAdminActionResponseSchema
>
