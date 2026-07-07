import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const scalingizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type ScalingizabilityAdminDomain = z.infer<typeof scalingizabilityAdminDomainSchema>

export const scalingizabilityAdminRecordSchema = z.object({
  domain: scalingizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ScalingizabilityAdminRecord = z.infer<typeof scalingizabilityAdminRecordSchema>

export const scalingizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  scalingizabilityPercent: z.number().min(0).max(100),
})
export type ScalingizabilityAdminStats = z.infer<typeof scalingizabilityAdminStatsSchema>

export const scalingizabilityAdminActionSchema = z.enum(['refresh_scalingizability_summary'])
export type ScalingizabilityAdminAction = z.infer<typeof scalingizabilityAdminActionSchema>

export const scalingizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(scalingizabilityAdminRecordSchema),
  stats: scalingizabilityAdminStatsSchema,
  availableActions: z.array(scalingizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ScalingizabilityAdminSummaryResponse = z.infer<
  typeof scalingizabilityAdminSummaryResponseSchema
>

export const scalingizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scalingizabilityAdminActionSchema,
})
export type ScalingizabilityAdminActionRequest = z.infer<
  typeof scalingizabilityAdminActionRequestSchema
>

export const scalingizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: scalingizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: scalingizabilityAdminStatsSchema.optional(),
})
export type ScalingizabilityAdminActionResponse = z.infer<
  typeof scalingizabilityAdminActionResponseSchema
>
