import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const tamperproofizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type TamperproofizabilityAdminDomain = z.infer<typeof tamperproofizabilityAdminDomainSchema>

export const tamperproofizabilityAdminRecordSchema = z.object({
  domain: tamperproofizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type TamperproofizabilityAdminRecord = z.infer<typeof tamperproofizabilityAdminRecordSchema>

export const tamperproofizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  tamperproofizabilityPercent: z.number().min(0).max(100),
})
export type TamperproofizabilityAdminStats = z.infer<typeof tamperproofizabilityAdminStatsSchema>

export const tamperproofizabilityAdminActionSchema = z.enum(['refresh_tamperproofizability_summary'])
export type TamperproofizabilityAdminAction = z.infer<typeof tamperproofizabilityAdminActionSchema>

export const tamperproofizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(tamperproofizabilityAdminRecordSchema),
  stats: tamperproofizabilityAdminStatsSchema,
  availableActions: z.array(tamperproofizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type TamperproofizabilityAdminSummaryResponse = z.infer<
  typeof tamperproofizabilityAdminSummaryResponseSchema
>

export const tamperproofizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tamperproofizabilityAdminActionSchema,
})
export type TamperproofizabilityAdminActionRequest = z.infer<
  typeof tamperproofizabilityAdminActionRequestSchema
>

export const tamperproofizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: tamperproofizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: tamperproofizabilityAdminStatsSchema.optional(),
})
export type TamperproofizabilityAdminActionResponse = z.infer<
  typeof tamperproofizabilityAdminActionResponseSchema
>
