import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'
import {
  managedProviderIdSchema,
  maskedProviderCredentialSchema,
} from './provider-credentials.js'
import { workspaceRoleSchema } from './workspace.js'

export const providerKeyAdminRecordSchema = maskedProviderCredentialSchema
export type ProviderKeyAdminRecord = z.infer<typeof providerKeyAdminRecordSchema>

export const providerKeyAdminStatsSchema = z.object({
  totalCredentials: z.number().int().nonnegative(),
  passedCredentials: z.number().int().nonnegative(),
  failedCredentials: z.number().int().nonnegative(),
  untestedCredentials: z.number().int().nonnegative(),
  anthropicCredentials: z.number().int().nonnegative(),
  openaiCredentials: z.number().int().nonnegative(),
  geminiCredentials: z.number().int().nonnegative(),
  cursorCredentials: z.number().int().nonnegative(),
  openrouterCredentials: z.number().int().nonnegative(),
})
export type ProviderKeyAdminStats = z.infer<typeof providerKeyAdminStatsSchema>

export const providerKeyAdminActionSchema = z.enum([
  'test_all_credentials',
  'retest_failed_credentials',
])
export type ProviderKeyAdminAction = z.infer<typeof providerKeyAdminActionSchema>

export const providerKeyAdminSummaryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  role: workspaceRoleSchema,
  credentials: z.array(providerKeyAdminRecordSchema),
  stats: providerKeyAdminStatsSchema,
  availableActions: z.array(providerKeyAdminActionSchema),
  guidance: nonEmptyStringSchema,
})
export type ProviderKeyAdminSummaryResponse = z.infer<
  typeof providerKeyAdminSummaryResponseSchema
>

export const providerKeyAdminActionRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: providerKeyAdminActionSchema,
})
export type ProviderKeyAdminActionRequest = z.infer<
  typeof providerKeyAdminActionRequestSchema
>

export const providerKeyAdminActionResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  action: providerKeyAdminActionSchema,
  message: nonEmptyStringSchema,
  stats: providerKeyAdminStatsSchema.optional(),
})
export type ProviderKeyAdminActionResponse = z.infer<
  typeof providerKeyAdminActionResponseSchema
>

export const providerKeyAdminTestResultSchema = z.object({
  credentialId: nonEmptyStringSchema,
  providerId: managedProviderIdSchema,
  status: z.enum(['passed', 'failed']),
  message: nonEmptyStringSchema,
})
export type ProviderKeyAdminTestResult = z.infer<
  typeof providerKeyAdminTestResultSchema
>
