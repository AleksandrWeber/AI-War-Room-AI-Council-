import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import { workspaceRoleSchema } from './workspace.js'

export const registryvaultizabilityAdminDomainSchema = z.enum([
  'completed_runs',
  'failed_runs',
  'billing_invoices',
  'billing_records',
])
export type RegistryvaultizabilityAdminDomain = z.infer<typeof registryvaultizabilityAdminDomainSchema>

export const registryvaultizabilityAdminRecordSchema = z.object({
  domain: registryvaultizabilityAdminDomainSchema,
  tableName: nonEmptyStringSchema,
  recordCount: z.number().int().nonnegative(),
  tableExists: z.boolean(),
})
export type RegistryvaultizabilityAdminRecord = z.infer<typeof registryvaultizabilityAdminRecordSchema>

export const registryvaultizabilityAdminStatsSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  coveredDomains: z.number().int().nonnegative(),
  totalDomains: z.number().int().nonnegative(),
  postgresConnectivity: z.boolean(),
  registryvaultizabilityPercent: z.number().min(0).max(100),
})
export type RegistryvaultizabilityAdminStats = z.infer<typeof registryvaultizabilityAdminStatsSchema>

export const registryvaultizabilityAdminActionSchema = z.enum(['refresh_registryvaultizability_summary'])
export type RegistryvaultizabilityAdminAction = z.infer<typeof registryvaultizabilityAdminActionSchema>

export const registryvaultizabilityAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  records: z.array(registryvaultizabilityAdminRecordSchema),
  stats: registryvaultizabilityAdminStatsSchema,
  availableActions: z.array(registryvaultizabilityAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type RegistryvaultizabilityAdminSummaryResponse = z.infer<
  typeof registryvaultizabilityAdminSummaryResponseSchema
>

export const registryvaultizabilityAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registryvaultizabilityAdminActionSchema,
})
export type RegistryvaultizabilityAdminActionRequest = z.infer<
  typeof registryvaultizabilityAdminActionRequestSchema
>

export const registryvaultizabilityAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: registryvaultizabilityAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: registryvaultizabilityAdminStatsSchema.optional(),
})
export type RegistryvaultizabilityAdminActionResponse = z.infer<
  typeof registryvaultizabilityAdminActionResponseSchema
>
