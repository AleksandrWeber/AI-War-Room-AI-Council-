import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'
import { llmGatewayProviderIdSchema } from './llm-provider.js'

export const modelRouterRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ModelRouterRolloutCheckStatus = z.infer<
  typeof modelRouterRolloutCheckStatusSchema
>

export const modelRouterRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: modelRouterRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ModelRouterRolloutCheck = z.infer<typeof modelRouterRolloutCheckSchema>

export const modelRouterRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ModelRouterRolloutStatus = z.infer<typeof modelRouterRolloutStatusSchema>

export const modelRouterCapabilitiesResponseSchema = z.object({
  llmPrimaryProvider: llmGatewayProviderIdSchema,
  llmFallbackProvider: llmGatewayProviderIdSchema,
  supportsModelRouterRollout: z.literal(true),
  supportsModelHealthAdminTools: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ModelRouterCapabilitiesResponse = z.infer<
  typeof modelRouterCapabilitiesResponseSchema
>

export const modelRouterRolloutResponseSchema = z.object({
  status: modelRouterRolloutStatusSchema,
  llmPrimaryProvider: llmGatewayProviderIdSchema,
  llmFallbackProvider: llmGatewayProviderIdSchema,
  checks: z.array(modelRouterRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ModelRouterRolloutResponse = z.infer<
  typeof modelRouterRolloutResponseSchema
>

export function getModelRouterGuidance(input: {
  llmPrimaryProvider: z.infer<typeof llmGatewayProviderIdSchema>
  llmFallbackProvider: z.infer<typeof llmGatewayProviderIdSchema>
}) {
  if (
    input.llmPrimaryProvider === 'mock' &&
    input.llmFallbackProvider === 'mock'
  ) {
    return 'Mock model router champions are active for local development and tests.'
  }

  return 'Model router aligns champions and deputies with configured LLM providers. Verify registry health before production rollout.'
}
