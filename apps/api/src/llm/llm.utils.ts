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

export function truncateText(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value
  }

  if (maxChars <= 1) {
    return value.slice(0, maxChars)
  }

  return `${value.slice(0, maxChars - 1)}…`
}

type TooBigStringIssue = {
  code: string
  origin?: string
  maximum?: number
  path: PropertyKey[]
}

function readPath(root: unknown, path: PropertyKey[]) {
  let current: unknown = root

  for (const key of path) {
    if (current === null || typeof current !== 'object') {
      return undefined
    }

    current = (current as Record<PropertyKey, unknown>)[key]
  }

  return current
}

function writePath(root: unknown, path: PropertyKey[], value: unknown) {
  if (path.length === 0 || root === null || typeof root !== 'object') {
    return
  }

  let current: Record<PropertyKey, unknown> = root as Record<PropertyKey, unknown>

  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index]!
    const next = current[key]

    if (next === null || typeof next !== 'object') {
      return
    }

    current = next as Record<PropertyKey, unknown>
  }

  current[path[path.length - 1]!] = value
}

/** Soft-fix Zod string `too_big` failures so oversized LLM fields can still validate. */
export function applyZodTooBigTruncation(
  value: unknown,
  issues: TooBigStringIssue[],
): unknown | null {
  const truncatable = issues.filter(
    (issue) =>
      issue.code === 'too_big' &&
      issue.origin === 'string' &&
      typeof issue.maximum === 'number' &&
      issue.maximum > 0,
  )

  if (truncatable.length === 0) {
    return null
  }

  const next = structuredClone(value)

  for (const issue of truncatable) {
    const current = readPath(next, issue.path)

    if (typeof current !== 'string') {
      continue
    }

    writePath(next, issue.path, truncateText(current, issue.maximum!))
  }

  return next
}
