import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const registrationizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_meter_usage_reports',
  'usage_events',
])
export type RegistrationizabilityAdminDomain = z.infer<typeof registrationizabilityAdminDomainSchema>

export const registrationizabilityAdminRecordSchema = z.object({
  domain: registrationizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RegistrationizabilityAdminRecord = z.infer<typeof registrationizabilityAdminRecordSchema>

export const registrationizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  registrationizabilityPercent: z.number().min(0).max(100),
})
export type RegistrationizabilityAdminStats = z.infer<typeof registrationizabilityAdminStatsSchema>

export const registrationizabilityAdminActionSchema = z.enum(['refresh_registrationizability_summary'])
export type RegistrationizabilityAdminAction = z.infer<typeof registrationizabilityAdminActionSchema>

export const registrationizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(registrationizabilityAdminRecordSchema),
  stats: registrationizabilityAdminStatsSchema,
  availableActions: z.array(registrationizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RegistrationizabilityAdminSummaryResponse = z.infer<
  typeof registrationizabilityAdminSummaryResponseSchema
>

export const registrationizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registrationizabilityAdminActionSchema,
})
export type RegistrationizabilityAdminActionRequest = z.infer<
  typeof registrationizabilityAdminActionRequestSchema
>

export const registrationizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registrationizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: registrationizabilityAdminStatsSchema.optional(),
})
export type RegistrationizabilityAdminActionResponse = z.infer<
  typeof registrationizabilityAdminActionResponseSchema
>
