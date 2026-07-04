import type { z } from 'zod'

export type LlmProviderId = 'mock' | 'anthropic' | 'openai'

export type LlmMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type LlmUsage = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCostUsd: number
}

export type LlmProviderRequest = {
  taskName: string
  model: string
  messages: LlmMessage[]
  responseFormat: 'json_object'
}

export type LlmProviderResponse = {
  rawText: string
  usage: LlmUsage
  providerId: LlmProviderId
  model: string
}

export interface LlmProvider {
  readonly providerId: LlmProviderId
  completeJson(request: LlmProviderRequest): Promise<LlmProviderResponse>
}

export type StructuredJsonRequest<TSchema extends z.ZodType> = {
  taskName: string
  schema: TSchema
  messages: LlmMessage[]
  fallback: z.infer<TSchema>
  maxAttempts?: number
}

export type StructuredJsonResult<TValue> = {
  value: TValue
  rawText: string
  validationStatus: 'valid' | 'repaired' | 'fallback'
  providerId: LlmProviderId
  model: string
  attempts: number
  usage: LlmUsage
  errors: string[]
}
