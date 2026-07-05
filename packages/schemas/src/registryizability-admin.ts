import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const registryizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_notifications',
  'billing_webhook_events',
])
export type RegistryizabilityAdminDomain = z.infer<typeof registryizabilityAdminDomainSchema>

export const registryizabilityAdminRecordSchema = z.object({
  domain: registryizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RegistryizabilityAdminRecord = z.infer<typeof registryizabilityAdminRecordSchema>

export const registryizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  registryizabilityPercent: z.number().min(0).max(100),
})
export type RegistryizabilityAdminStats = z.infer<typeof registryizabilityAdminStatsSchema>

export const registryizabilityAdminActionSchema = z.enum(['refresh_registryizability_summary'])
export type RegistryizabilityAdminAction = z.infer<typeof registryizabilityAdminActionSchema>

export const registryizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(registryizabilityAdminRecordSchema),
  stats: registryizabilityAdminStatsSchema,
  availableActions: z.array(registryizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RegistryizabilityAdminSummaryResponse = z.infer<
  typeof registryizabilityAdminSummaryResponseSchema
>

export const registryizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registryizabilityAdminActionSchema,
})
export type RegistryizabilityAdminActionRequest = z.infer<
  typeof registryizabilityAdminActionRequestSchema
>

export const registryizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registryizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: registryizabilityAdminStatsSchema.optional(),
})
export type RegistryizabilityAdminActionResponse = z.infer<
  typeof registryizabilityAdminActionResponseSchema
>
