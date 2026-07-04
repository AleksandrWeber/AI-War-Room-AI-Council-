import { describe, expect, it } from 'vitest'
import { triageResultSchema } from '@ai-war-room/schemas'
import { runPromptEvaluation } from './prompt-evaluation.runner.js'
import { promptRegressionDataset } from './prompt-regression.dataset.js'

describe('prompt evaluation runner', () => {
  it('passes the prompt regression dataset against the mock provider', async () => {
    const report = await runPromptEvaluation()

    expect(report.totalCases).toBe(promptRegressionDataset.length)
    expect(report.failedCases).toBe(0)
    expect(report.promptVersions['triage-standard-saas']).toBe('triage/v1')
    expect(
      report.results.every(
        (result) =>
          result.schemaValid &&
          result.clarityScore >= 0.6 &&
          result.usefulnessScore >= 0.6,
      ),
    ).toBe(true)
  })

  it('flags prompt version drift as a regression', async () => {
    const report = await runPromptEvaluation({
      dataset: [
        {
          caseId: 'version-drift',
          taskName: 'triage/v2',
          expectedPromptVersion: 'triage/v1',
          schema: triageResultSchema,
          messages: [
            {
              role: 'user',
              content: [
                'MOCK_JSON:',
                JSON.stringify({
                  domain: 'software',
                  subdomain: 'SaaS planning',
                  complexity: 'medium',
                  marketConfidence: 'medium',
                  securitySensitivity: 'medium',
                  recommendedRunMode: 'standard',
                  recommendedAgents: ['product_manager', 'critic', 'moderator'],
                  estimatedDurationSeconds: 60,
                  estimatedMaxCostUsd: 0.5,
                  reasoningSummary:
                    'Prompt regression fixture validates version drift.',
                }),
              ].join(''),
            },
          ],
          minimumClarityScore: 0.1,
          minimumUsefulnessScore: 0.1,
        },
      ],
    })

    expect(report.failedCases).toBe(1)
    expect(report.results[0].promptVersionChanged).toBe(true)
    expect(report.results[0].errors[0]).toContain('Prompt version changed')
  })
})
