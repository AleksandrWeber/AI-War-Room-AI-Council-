import type { z } from 'zod'
import { MockLlmProvider } from '../llm/mock-llm.provider.js'
import type { LlmProvider } from '../llm/llm.types.js'
import { parseJsonObject } from '../llm/llm.utils.js'
import {
  promptRegressionDataset,
  type PromptRegressionCase,
} from './prompt-regression.dataset.js'

export type PromptEvaluationCaseResult = {
  caseId: string
  taskName: string
  expectedPromptVersion: string
  actualPromptVersion: string
  promptVersionChanged: boolean
  schemaValid: boolean
  clarityScore: number
  usefulnessScore: number
  passed: boolean
  errors: string[]
}

export type PromptEvaluationReport = {
  generatedAt: string
  totalCases: number
  passedCases: number
  failedCases: number
  promptVersions: Record<string, string>
  results: PromptEvaluationCaseResult[]
}

export async function runPromptEvaluation(input: {
  provider?: LlmProvider
  dataset?: PromptRegressionCase[]
} = {}): Promise<PromptEvaluationReport> {
  const provider = input.provider ?? new MockLlmProvider()
  const dataset = input.dataset ?? promptRegressionDataset
  const results = await Promise.all(
    dataset.map((testCase) => evaluatePromptCase(provider, testCase)),
  )

  return {
    generatedAt: new Date().toISOString(),
    totalCases: results.length,
    passedCases: results.filter((result) => result.passed).length,
    failedCases: results.filter((result) => !result.passed).length,
    promptVersions: Object.fromEntries(
      results.map((result) => [result.caseId, result.actualPromptVersion]),
    ),
    results,
  }
}

async function evaluatePromptCase(
  provider: LlmProvider,
  testCase: PromptRegressionCase,
): Promise<PromptEvaluationCaseResult> {
  const errors: string[] = []
  const response = await provider.completeJson({
    taskName: testCase.taskName,
    model: 'mock-json-v1',
    messages: testCase.messages,
    responseFormat: 'json_object',
  })
  let parsedValue: unknown = null
  let schemaValid = false

  try {
    parsedValue = parseJsonObject(response.rawText)
    const result = testCase.schema.safeParse(parsedValue)
    schemaValid = result.success

    if (!result.success) {
      errors.push(
        ...result.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`,
        ),
      )
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown parse error.')
  }

  const clarityScore = scoreClarity(parsedValue)
  const usefulnessScore = scoreUsefulness(parsedValue, testCase.schema)
  const promptVersionChanged =
    testCase.taskName !== testCase.expectedPromptVersion

  if (clarityScore < testCase.minimumClarityScore) {
    errors.push(
      `Clarity score ${clarityScore.toFixed(2)} is below ${testCase.minimumClarityScore}.`,
    )
  }

  if (usefulnessScore < testCase.minimumUsefulnessScore) {
    errors.push(
      `Usefulness score ${usefulnessScore.toFixed(2)} is below ${testCase.minimumUsefulnessScore}.`,
    )
  }

  if (promptVersionChanged) {
    errors.push(
      `Prompt version changed from ${testCase.expectedPromptVersion} to ${testCase.taskName}.`,
    )
  }

  return {
    caseId: testCase.caseId,
    taskName: testCase.taskName,
    expectedPromptVersion: testCase.expectedPromptVersion,
    actualPromptVersion: testCase.taskName,
    promptVersionChanged,
    schemaValid,
    clarityScore,
    usefulnessScore,
    passed: schemaValid && errors.length === 0,
    errors,
  }
}

function scoreClarity(value: unknown) {
  const strings = collectStrings(value)

  if (strings.length === 0) {
    return 0
  }

  const averageLength =
    strings.reduce((total, item) => total + item.length, 0) / strings.length
  const structureCoverage = Math.min(strings.length / 8, 1)

  return clamp01((averageLength / 40) * 0.5 + structureCoverage * 0.5)
}

function scoreUsefulness(value: unknown, schema: z.ZodType) {
  const parsed = schema.safeParse(value)

  if (!parsed.success) {
    return 0
  }

  const strings = collectStrings(parsed.data)
  const arrays = collectArrays(parsed.data)
  const hasActionableContent = strings.some((item) =>
    /recommend|scope|risk|requirement|prompt|artifact|validate|review/i.test(item),
  )

  return clamp01(
    0.4 +
      Math.min(strings.length, 8) * 0.05 +
      Math.min(arrays.length, 4) * 0.05 +
      (hasActionableContent ? 0.2 : 0),
  )
}

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStrings(item))
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap((item) => collectStrings(item))
  }

  return []
}

function collectArrays(value: unknown): unknown[][] {
  if (Array.isArray(value)) {
    return [value, ...value.flatMap((item) => collectArrays(item))]
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap((item) => collectArrays(item))
  }

  return []
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}
