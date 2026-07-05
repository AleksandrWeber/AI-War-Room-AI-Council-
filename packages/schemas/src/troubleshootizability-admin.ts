import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const troubleshootizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type TroubleshootizabilityAdminDomain = z.infer<typeof troubleshootizabilityAdminDomainSchema>

export const troubleshootizabilityAdminRecordSchema = z.object({
  domain: troubleshootizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TroubleshootizabilityAdminRecord = z.infer<typeof troubleshootizabilityAdminRecordSchema>

export const troubleshootizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  troubleshootizabilityPercent: z.number().min(0).max(100),
})
export type TroubleshootizabilityAdminStats = z.infer<typeof troubleshootizabilityAdminStatsSchema>

export const troubleshootizabilityAdminActionSchema = z.enum(['refresh_troubleshootizability_summary'])
export type TroubleshootizabilityAdminAction = z.infer<typeof troubleshootizabilityAdminActionSchema>

export const troubleshootizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(troubleshootizabilityAdminRecordSchema),
  stats: troubleshootizabilityAdminStatsSchema,
  availableActions: z.array(troubleshootizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TroubleshootizabilityAdminSummaryResponse = z.infer<
  typeof troubleshootizabilityAdminSummaryResponseSchema
>

export const troubleshootizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: troubleshootizabilityAdminActionSchema,
})
export type TroubleshootizabilityAdminActionRequest = z.infer<
  typeof troubleshootizabilityAdminActionRequestSchema
>

export const troubleshootizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: troubleshootizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: troubleshootizabilityAdminStatsSchema.optional(),
})
export type TroubleshootizabilityAdminActionResponse = z.infer<
  typeof troubleshootizabilityAdminActionResponseSchema
>
