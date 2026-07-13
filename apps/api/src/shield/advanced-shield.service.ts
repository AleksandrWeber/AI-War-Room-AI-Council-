import { Injectable } from '@nestjs/common'
import type { ShieldFindingSource } from '@ai-war-room/schemas'
import { ObservabilityService } from '../observability/observability.service.js'
import { DeterministicShieldClassifier } from './deterministic-shield.classifier.js'
import { LlmShieldClassifierService } from './llm-shield-classifier.service.js'
import { shieldFalsePositiveReviewSet } from './shield-review-set.js'

@Injectable()
export class AdvancedShieldService {
  constructor(
    private readonly classifier: DeterministicShieldClassifier,
    private readonly llmShieldClassifierService: LlmShieldClassifierService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  async scanText(input: {
    workspaceId?: string
    runId?: string
    text: string
    source: ShieldFindingSource
  }) {
    const deterministicScan = await this.classifier.classify({
      text: input.text,
      source: input.source,
    })
    const scan = await this.llmShieldClassifierService.escalateIfNeeded({
      text: input.text,
      source: input.source,
      workspaceId: input.workspaceId,
      runId: input.runId,
      baseScan: deterministicScan,
    })

    const classifierId = this.llmShieldClassifierService.shouldEscalate({
      text: input.text,
      baseScan: deterministicScan,
    })
      ? 'layered-shield-llm/v1'
      : this.classifier.classifierId

    this.observabilityService.record(
      'shield_scan_classified',
      {
        workspaceId: input.workspaceId ?? null,
        runId: input.runId ?? null,
        source: input.source,
        classifierId,
        status: scan.status,
        maxSeverity: scan.maxSeverity,
        findingCount: scan.findings.length,
      },
      scan.status === 'blocked' ? 'warn' : 'info',
    )

    if (scan.status === 'blocked') {
      this.observabilityService.record(
        'shield_abuse_signal',
        {
          workspaceId: input.workspaceId ?? null,
          runId: input.runId ?? null,
          source: input.source,
          maxSeverity: scan.maxSeverity,
          findingCount: scan.findings.length,
          quotaImpact: 'execution_blocked',
        },
        'warn',
      )
    }

    return scan
  }

  async getReviewSummary() {
    const results = await Promise.all(
      shieldFalsePositiveReviewSet.map(async (testCase) => {
        const scan = await this.classifier.classify({
          text: testCase.text,
          source: 'user_input',
        })

        return {
          caseId: testCase.caseId,
          expectedStatus: testCase.expectedStatus,
          actualStatus: scan.status,
          passed: scan.status === testCase.expectedStatus,
        }
      }),
    )
    const falsePositives = results.filter(
      (result) =>
        result.expectedStatus === 'clear' &&
        (result.actualStatus === 'warning' || result.actualStatus === 'blocked'),
    )

    return {
      classifierId: this.classifier.classifierId,
      totalCases: results.length,
      passedCases: results.filter((result) => result.passed).length,
      falsePositiveCount: falsePositives.length,
      falsePositiveRate:
        results.length === 0 ? 0 : falsePositives.length / results.length,
      results,
    }
  }
}
