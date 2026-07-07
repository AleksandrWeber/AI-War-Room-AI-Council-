import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const modifiabilityvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type ModifiabilityvaultizabilityAdminDomain = z.infer<typeof modifiabilityvaultizabilityAdminDomainSchema>

export const modifiabilityvaultizabilityAdminRecordSchema = z.object({
  domain: modifiabilityvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type ModifiabilityvaultizabilityAdminRecord = z.infer<typeof modifiabilityvaultizabilityAdminRecordSchema>

export const modifiabilityvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  modifiabilityvaultizabilityPercent: z.number().min(0).max(100),
})
export type ModifiabilityvaultizabilityAdminStats = z.infer<typeof modifiabilityvaultizabilityAdminStatsSchema>

export const modifiabilityvaultizabilityAdminActionSchema = z.enum(['refresh_modifiabilityvaultizability_summary'])
export type ModifiabilityvaultizabilityAdminAction = z.infer<typeof modifiabilityvaultizabilityAdminActionSchema>

export const modifiabilityvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(modifiabilityvaultizabilityAdminRecordSchema),
  stats: modifiabilityvaultizabilityAdminStatsSchema,
  availableActions: z.array(modifiabilityvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ModifiabilityvaultizabilityAdminSummaryResponse = z.infer<
  typeof modifiabilityvaultizabilityAdminSummaryResponseSchema
>

export const modifiabilityvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modifiabilityvaultizabilityAdminActionSchema,
})
export type ModifiabilityvaultizabilityAdminActionRequest = z.infer<
  typeof modifiabilityvaultizabilityAdminActionRequestSchema
>

export const modifiabilityvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: modifiabilityvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: modifiabilityvaultizabilityAdminStatsSchema.optional(),
})
export type ModifiabilityvaultizabilityAdminActionResponse = z.infer<
  typeof modifiabilityvaultizabilityAdminActionResponseSchema
>
