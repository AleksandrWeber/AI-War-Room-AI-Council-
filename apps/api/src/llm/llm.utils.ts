import type { LlmMessage, LlmUsage } from './llm.types.js'

export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4)
}

export function estimateMessageTokens(messages: LlmMessage[]) {
  return messages.reduce(
    (total, message) => total + estimateTokens(message.content),
    0,
  )
}

export function createUsage(inputTokens: number, outputTokens: number): LlmUsage {
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCostUsd: 0,
  }
}

export function addUsage(left: LlmUsage, right: LlmUsage): LlmUsage {
  return {
    inputTokens: left.inputTokens + right.inputTokens,
    outputTokens: left.outputTokens + right.outputTokens,
    totalTokens: left.totalTokens + right.totalTokens,
    estimatedCostUsd: left.estimatedCostUsd + right.estimatedCostUsd,
  }
}

export function emptyUsage(): LlmUsage {
  return createUsage(0, 0)
}

export function parseJsonObject(rawText: string) {
  const trimmed = rawText.trim()

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed) as unknown
  }

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('LLM response did not contain a JSON object.')
  }

  return JSON.parse(trimmed.slice(start, end + 1)) as unknown
}
