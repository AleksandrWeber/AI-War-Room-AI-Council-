import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const trustworthinessvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type TrustworthinessvaultizabilityAdminDomain = z.infer<typeof trustworthinessvaultizabilityAdminDomainSchema>

export const trustworthinessvaultizabilityAdminRecordSchema = z.object({
  domain: trustworthinessvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TrustworthinessvaultizabilityAdminRecord = z.infer<typeof trustworthinessvaultizabilityAdminRecordSchema>

export const trustworthinessvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  trustworthinessvaultizabilityPercent: z.number().min(0).max(100),
})
export type TrustworthinessvaultizabilityAdminStats = z.infer<typeof trustworthinessvaultizabilityAdminStatsSchema>

export const trustworthinessvaultizabilityAdminActionSchema = z.enum(['refresh_trustworthinessvaultizability_summary'])
export type TrustworthinessvaultizabilityAdminAction = z.infer<typeof trustworthinessvaultizabilityAdminActionSchema>

export const trustworthinessvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(trustworthinessvaultizabilityAdminRecordSchema),
  stats: trustworthinessvaultizabilityAdminStatsSchema,
  availableActions: z.array(trustworthinessvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TrustworthinessvaultizabilityAdminSummaryResponse = z.infer<
  typeof trustworthinessvaultizabilityAdminSummaryResponseSchema
>

export const trustworthinessvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: trustworthinessvaultizabilityAdminActionSchema,
})
export type TrustworthinessvaultizabilityAdminActionRequest = z.infer<
  typeof trustworthinessvaultizabilityAdminActionRequestSchema
>

export const trustworthinessvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: trustworthinessvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: trustworthinessvaultizabilityAdminStatsSchema.optional(),
})
export type TrustworthinessvaultizabilityAdminActionResponse = z.infer<
  typeof trustworthinessvaultizabilityAdminActionResponseSchema
>
