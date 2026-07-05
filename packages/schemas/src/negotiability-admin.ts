import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const negotiabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type NegotiabilityAdminDomain = z.infer<typeof negotiabilityAdminDomainSchema>

export const negotiabilityAdminRecordSchema = z.object({
  domain: negotiabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type NegotiabilityAdminRecord = z.infer<typeof negotiabilityAdminRecordSchema>

export const negotiabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  negotiabilityPercent: z.number().min(0).max(100),
})
export type NegotiabilityAdminStats = z.infer<typeof negotiabilityAdminStatsSchema>

export const negotiabilityAdminActionSchema = z.enum(['refresh_negotiability_summary'])
export type NegotiabilityAdminAction = z.infer<typeof negotiabilityAdminActionSchema>

export const negotiabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(negotiabilityAdminRecordSchema),
  stats: negotiabilityAdminStatsSchema,
  availableActions: z.array(negotiabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type NegotiabilityAdminSummaryResponse = z.infer<
  typeof negotiabilityAdminSummaryResponseSchema
>

export const negotiabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: negotiabilityAdminActionSchema,
})
export type NegotiabilityAdminActionRequest = z.infer<
  typeof negotiabilityAdminActionRequestSchema
>

export const negotiabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: negotiabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: negotiabilityAdminStatsSchema.optional(),
})
export type NegotiabilityAdminActionResponse = z.infer<
  typeof negotiabilityAdminActionResponseSchema
>
