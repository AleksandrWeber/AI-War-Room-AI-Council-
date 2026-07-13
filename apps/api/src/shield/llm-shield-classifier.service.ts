import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  type ShieldFinding,
  type ShieldFindingSource,
  type ShieldScanResult,
  shieldLlmClassifierResponseSchema,
} from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { shieldLlmClassifierPromptV1 } from '../prompts/shield-classifier.prompts.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

const HIGH_RISK_DOMAIN_PATTERN =
  /\b(health(?:care)?|medical|phi|hipaa|financ(?:e|ial)|bank(?:ing)?|payment|pci|child(?:ren)?|minor|biometric|weapon|exploit|ransomware|zero[- ]?day)\b/i

const SEVERITY_RANK: Record<ShieldScanResult['maxSeverity'], number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

@Injectable()
export class LlmShieldClassifierService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly llmGatewayService: LlmGatewayService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  shouldEscalate(input: {
    text: string
    baseScan: ShieldScanResult
  }): boolean {
    if (
      !this.configService.get('SHIELD_LLM_ESCALATION_ENABLED', { infer: true })
    ) {
      return false
    }

    if (input.baseScan.findings.length > 0) {
      return true
    }

    return HIGH_RISK_DOMAIN_PATTERN.test(input.text)
  }

  async escalateIfNeeded(input: {
    text: string
    source: ShieldFindingSource
    workspaceId?: string
    runId?: string
    baseScan: ShieldScanResult
  }): Promise<ShieldScanResult> {
    if (!this.shouldEscalate(input)) {
      return input.baseScan
    }

    try {
      const result = await this.llmGatewayService.generateStructuredJson({
        taskName: shieldLlmClassifierPromptV1.version,
        schema: shieldLlmClassifierResponseSchema,
        workspaceId: input.workspaceId,
        messages: [
          {
            role: 'system',
            content: shieldLlmClassifierPromptV1.system,
          },
          {
            role: 'user',
            content: `${shieldLlmClassifierPromptV1.userTemplate}${JSON.stringify(
              {
                source: input.source,
                text: input.text.slice(0, 8_000),
                deterministicFindings: input.baseScan.findings.map((finding) => ({
                  severity: finding.severity,
                  category: finding.category,
                  recommendedAction: finding.recommendedAction,
                  explanation: finding.explanation,
                  span: finding.span,
                })),
              },
            )}`,
          },
        ],
        fallback: { findings: [], rationale: 'fallback_empty' },
        maxAttempts: 2,
      })

      const llmFindings = result.value.findings.map<ShieldFinding>((finding) => {
        const hasSpan =
          typeof finding.spanStart === 'number' &&
          typeof finding.spanEnd === 'number' &&
          finding.spanEnd > finding.spanStart

        return {
          findingId: createId('finding'),
          severity: finding.severity,
          category: finding.category,
          source: input.source,
          span: hasSpan
            ? {
                start: finding.spanStart!,
                end: finding.spanEnd!,
                quote:
                  finding.quote?.trim() ||
                  input.text.slice(finding.spanStart!, finding.spanEnd!).slice(0, 2_000) ||
                  'llm_span',
              }
            : finding.quote?.trim()
              ? {
                  start: 0,
                  end: Math.min(finding.quote.trim().length, input.text.length),
                  quote: finding.quote.trim(),
                }
              : undefined,
          explanation: finding.explanation,
          recommendedAction: finding.recommendedAction,
        }
      })

      const merged = this.mergeScans(input.baseScan, llmFindings)

      this.observabilityService.record('shield_llm_escalation', {
        workspaceId: input.workspaceId ?? null,
        runId: input.runId ?? null,
        source: input.source,
        baseFindingCount: input.baseScan.findings.length,
        llmFindingCount: llmFindings.length,
        mergedFindingCount: merged.findings.length,
        mergedMaxSeverity: merged.maxSeverity,
        validationStatus: result.validationStatus,
      })

      return merged
    } catch (error) {
      this.observabilityService.record(
        'shield_llm_escalation_failed',
        {
          workspaceId: input.workspaceId ?? null,
          runId: input.runId ?? null,
          source: input.source,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown escalation failure.',
        },
        'warn',
      )

      return input.baseScan
    }
  }

  private mergeScans(
    baseScan: ShieldScanResult,
    llmFindings: ShieldFinding[],
  ): ShieldScanResult {
    const findings = [...baseScan.findings, ...llmFindings]
    const maxSeverity = findings.reduce<ShieldScanResult['maxSeverity']>(
      (current, finding) =>
        SEVERITY_RANK[finding.severity] > SEVERITY_RANK[current]
          ? finding.severity
          : current,
      baseScan.maxSeverity,
    )

    return {
      scanId: baseScan.scanId,
      maxSeverity,
      findings,
      status:
        maxSeverity === 'critical'
          ? 'blocked'
          : findings.length > 0
            ? 'warning'
            : 'clear',
    }
  }
}
