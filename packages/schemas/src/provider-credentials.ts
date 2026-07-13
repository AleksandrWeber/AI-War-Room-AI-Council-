import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

/** LLM-only providers used by the model gateway. */
export const llmProviderIdSchema = z.enum(['anthropic', 'openai', 'gemini'])
export type ManagedLlmProviderId = z.infer<typeof llmProviderIdSchema>

/** Research providers that can use workspace BYOK credentials. */
export const researchCredentialProviderIdSchema = z.enum(['tavily', 'serper'])
export type ResearchCredentialProviderId = z.infer<
  typeof researchCredentialProviderIdSchema
>

/** All providers stored in workspace_provider_credentials. */
export const managedProviderIdSchema = z.enum([
  'anthropic',
  'openai',
  'gemini',
  'tavily',
  'serper',
])
export type ManagedProviderId = z.infer<typeof managedProviderIdSchema>

export const maskedProviderCredentialSchema = z.object({
  credentialId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  providerId: managedProviderIdSchema,
  label: nonEmptyStringSchema.max(120),
  maskedKey: nonEmptyStringSchema,
  createdByUserId: nonEmptyStringSchema,
  createdAt: utcDateStringSchema,
  updatedAt: utcDateStringSchema,
  lastTestedAt: utcDateStringSchema.optional(),
  lastTestStatus: z.enum(['untested', 'passed', 'failed']),
  lastTestError: z.string().max(500).optional(),
})
export type MaskedProviderCredential = z.infer<
  typeof maskedProviderCredentialSchema
>

export const providerCredentialListResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  credentials: z.array(maskedProviderCredentialSchema),
  needsProviderKey: z.boolean(),
  instructions: z.record(
    managedProviderIdSchema,
    z.object({
      label: nonEmptyStringSchema,
      url: z.url(),
      steps: z.array(nonEmptyStringSchema).min(1),
    }),
  ),
})
export type ProviderCredentialListResponse = z.infer<
  typeof providerCredentialListResponseSchema
>

export const upsertProviderCredentialRequestSchema = z.object({
  providerId: managedProviderIdSchema,
  label: nonEmptyStringSchema.max(120),
  apiKey: nonEmptyStringSchema.min(12).max(4096),
})
export type UpsertProviderCredentialRequest = z.infer<
  typeof upsertProviderCredentialRequestSchema
>

export const providerCredentialTestResponseSchema = z.object({
  credentialId: nonEmptyStringSchema,
  providerId: managedProviderIdSchema,
  status: z.enum(['passed', 'failed']),
  message: nonEmptyStringSchema,
  testedAt: utcDateStringSchema,
})
export type ProviderCredentialTestResponse = z.infer<
  typeof providerCredentialTestResponseSchema
>
