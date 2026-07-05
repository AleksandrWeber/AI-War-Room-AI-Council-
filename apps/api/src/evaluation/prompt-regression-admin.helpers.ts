import type {
  PromptRegressionAdminAction,
  PromptRegressionAdminCase,
  PromptRegressionAdminStats,
} from '@ai-war-room/schemas'
import type { PromptEvaluationReport } from './prompt-evaluation.runner.js'

export function buildPromptRegressionAdminStats(
  report: Pick<
    PromptEvaluationReport,
    'totalCases' | 'passedCases' | 'failedCases' | 'results'
  >,
): PromptRegressionAdminStats {
  return {
    totalCases: report.totalCases,
    passedCases: report.passedCases,
    failedCases: report.failedCases,
    promptVersionDriftCount: report.results.filter(
      (result) => result.promptVersionChanged,
    ).length,
    schemaInvalidCount: report.results.filter((result) => !result.schemaValid)
      .length,
  }
}

export function resolvePromptRegressionAdminActions(input: {
  stats: PromptRegressionAdminStats
}) {
  const actions: PromptRegressionAdminAction[] = ['rerun_prompt_regression']

  if (input.stats.failedCases > 0) {
    return actions
  }

  return actions
}

export function getPromptRegressionAdminGuidance(input: {
  stats: PromptRegressionAdminStats
}) {
  if (input.stats.failedCases > 0) {
    return 'Workspace owners and admins can inspect failing prompt regression cases and rerun the evaluation suite.'
  }

  if (input.stats.promptVersionDriftCount > 0) {
    return 'Workspace owners and admins can inspect prompt version drift and rerun the regression suite.'
  }

  return 'Workspace owners and admins can inspect prompt regression metrics and rerun the evaluation suite locally.'
}

export function toPromptRegressionAdminCases(
  report: PromptEvaluationReport,
): PromptRegressionAdminCase[] {
  return report.results.map((result) => ({
    caseId: result.caseId,
    expectedPromptVersion: result.expectedPromptVersion,
    actualPromptVersion: result.actualPromptVersion,
    schemaValid: result.schemaValid,
    clarityScore: result.clarityScore,
    usefulnessScore: result.usefulnessScore,
    promptVersionChanged: result.promptVersionChanged,
    passed: result.passed,
  }))
}
