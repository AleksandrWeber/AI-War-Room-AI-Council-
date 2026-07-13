import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const llmGatewayProviderIdSchema = z.enum([
  'mock',
  'anthropic',
  'openai',
  'gemini',
  'cursor',
  'openrouter',
])
export type LlmGatewayProviderId = z.infer<typeof llmGatewayProviderIdSchema>

export const llmCapabilitiesResponseSchema = z.object({
  primaryProvider: llmGatewayProviderIdSchema,
  fallbackProvider: llmGatewayProviderIdSchema,
  primaryModel: nonEmptyStringSchema,
  fallbackModel: nonEmptyStringSchema,
  researchProvider: z.enum(['mock', 'tavily']),
  supportsLlmRollout: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LlmCapabilitiesResponse = z.infer<
  typeof llmCapabilitiesResponseSchema
>

export const llmRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LlmRolloutCheckStatus = z.infer<typeof llmRolloutCheckStatusSchema>

export const llmRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: llmRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LlmRolloutCheck = z.infer<typeof llmRolloutCheckSchema>

export const llmRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LlmRolloutStatus = z.infer<typeof llmRolloutStatusSchema>

export const llmRolloutResponseSchema = z.object({
  status: llmRolloutStatusSchema,
  primaryProvider: llmGatewayProviderIdSchema,
  fallbackProvider: llmGatewayProviderIdSchema,
  checks: z.array(llmRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LlmRolloutResponse = z.infer<typeof llmRolloutResponseSchema>

export function getLlmProviderGuidance(input: {
  primaryProvider: LlmGatewayProviderId
  fallbackProvider: LlmGatewayProviderId
}) {
  if (input.primaryProvider === 'mock') {
    return 'Mock LLM providers are active for local development and tests.'
  }

  return `LLM gateway uses ${input.primaryProvider} as primary and ${input.fallbackProvider} as fallback. Configure provider API keys or workspace BYOK credentials before production rollout.`
}
