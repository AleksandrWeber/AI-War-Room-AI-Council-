import { DeterministicShieldClassifier } from './deterministic-shield.classifier.js'
import {
  shieldAdversarialDataset,
  type ShieldAdversarialCase,
} from './shield-adversarial.dataset.js'
import type { ShieldClassifier } from './shield-classifier.types.js'

export type ShieldAdversarialResult = {
  caseId: string
  passed: boolean
  expectedStatus: ShieldAdversarialCase['expectedStatus']
  actualStatus: ShieldAdversarialCase['expectedStatus']
  expectedCategory?: ShieldAdversarialCase['expectedCategory']
  actualCategories: string[]
  errors: string[]
}

export type ShieldAdversarialReport = {
  totalCases: number
  failedCases: number
  results: ShieldAdversarialResult[]
}

export async function runShieldAdversarialEvaluation(input?: {
  dataset?: ShieldAdversarialCase[]
  classifier?: ShieldClassifier
}): Promise<ShieldAdversarialReport> {
  const dataset = input?.dataset ?? shieldAdversarialDataset
  const classifier = input?.classifier ?? new DeterministicShieldClassifier()
  const results = await Promise.all(
    dataset.map(async (testCase): Promise<ShieldAdversarialResult> => {
      const scan = await classifier.classify({
        text: testCase.text,
        source: testCase.source,
      })
      const actualCategories = scan.findings.map((finding) => finding.category)
      const errors: string[] = []

      if (scan.status !== testCase.expectedStatus) {
        errors.push(
          `Expected status ${testCase.expectedStatus}, received ${scan.status}.`,
        )
      }

      if (
        testCase.expectedCategory &&
        !actualCategories.includes(testCase.expectedCategory)
      ) {
        errors.push(
          `Expected category ${testCase.expectedCategory}, received ${actualCategories.join(', ') || 'none'}.`,
        )
      }

      return {
        caseId: testCase.caseId,
        passed: errors.length === 0,
        expectedStatus: testCase.expectedStatus,
        actualStatus: scan.status,
        expectedCategory: testCase.expectedCategory,
        actualCategories,
        errors,
      }
    }),
  )

  return {
    totalCases: results.length,
    failedCases: results.filter((result) => !result.passed).length,
    results,
  }
}
