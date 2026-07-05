import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const stylizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type StylizabilityAdminDomain = z.infer<typeof stylizabilityAdminDomainSchema>

export const stylizabilityAdminRecordSchema = z.object({
  domain: stylizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type StylizabilityAdminRecord = z.infer<typeof stylizabilityAdminRecordSchema>

export const stylizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  stylizabilityPercent: z.number().min(0).max(100),
})
export type StylizabilityAdminStats = z.infer<typeof stylizabilityAdminStatsSchema>

export const stylizabilityAdminActionSchema = z.enum(['refresh_stylizability_summary'])
export type StylizabilityAdminAction = z.infer<typeof stylizabilityAdminActionSchema>

export const stylizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(stylizabilityAdminRecordSchema),
  stats: stylizabilityAdminStatsSchema,
  availableActions: z.array(stylizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type StylizabilityAdminSummaryResponse = z.infer<
  typeof stylizabilityAdminSummaryResponseSchema
>

export const stylizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stylizabilityAdminActionSchema,
})
export type StylizabilityAdminActionRequest = z.infer<
  typeof stylizabilityAdminActionRequestSchema
>

export const stylizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: stylizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: stylizabilityAdminStatsSchema.optional(),
})
export type StylizabilityAdminActionResponse = z.infer<
  typeof stylizabilityAdminActionResponseSchema
>
