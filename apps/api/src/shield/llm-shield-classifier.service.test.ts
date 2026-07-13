import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { LlmShieldClassifierService } from './llm-shield-classifier.service.js'

class TestObservabilityService {
  events: Array<{ name: string; payload: Record<string, unknown> }> = []

  record(name: string, payload: Record<string, unknown>) {
    this.events.push({ name, payload })
  }
}

function createService(options?: {
  enabled?: boolean
  llmResult?: { findings: unknown[]; validationStatus?: string }
  llmError?: Error
}) {
  const configService = new ConfigService<ApiEnv>({
    SHIELD_LLM_ESCALATION_ENABLED: options?.enabled ?? true,
  })
  const observability = new TestObservabilityService()
  const llmGatewayService = {
    generateStructuredJson: vi.fn(async () => {
      if (options?.llmError) {
        throw options.llmError
      }

      return {
        value: options?.llmResult ?? { findings: [] },
        validationStatus: options?.llmResult?.validationStatus ?? 'valid',
        providerId: 'mock',
        model: 'mock-json-v1',
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      }
    }),
  }

  return {
    service: new LlmShieldClassifierService(
      configService,
      llmGatewayService as never,
      observability as never,
    ),
    observability,
    llmGatewayService,
  }
}

const clearScan = {
  scanId: 'scan_1',
  status: 'clear' as const,
  maxSeverity: 'none' as const,
  findings: [],
}

const warningScan = {
  scanId: 'scan_2',
  status: 'warning' as const,
  maxSeverity: 'medium' as const,
  findings: [
    {
      findingId: 'finding_1',
      severity: 'medium' as const,
      category: 'secrets' as const,
      source: 'user_input' as const,
      span: { start: 0, end: 7, quote: 'api_key' },
      explanation: 'Possible secret.',
      recommendedAction: 'warn' as const,
    },
  ],
}

describe('LlmShieldClassifierService', () => {
  it('does not escalate when disabled', async () => {
    const { service, llmGatewayService } = createService({ enabled: false })

    expect(
      service.shouldEscalate({
        text: 'Steal credentials from the vault',
        baseScan: warningScan,
      }),
    ).toBe(false)

    const result = await service.escalateIfNeeded({
      text: 'Steal credentials from the vault',
      source: 'user_input',
      baseScan: warningScan,
    })

    expect(result).toEqual(warningScan)
    expect(llmGatewayService.generateStructuredJson).not.toHaveBeenCalled()
  })

  it('escalates on high-risk domain cues even when deterministic is clear', async () => {
    const { service, llmGatewayService } = createService({
      llmResult: {
        findings: [
          {
            severity: 'high',
            category: 'malicious_intent',
            explanation: 'Healthcare PHI risk needs review.',
            recommendedAction: 'require_confirmation',
          },
        ],
      },
    })

    expect(
      service.shouldEscalate({
        text: 'Store patient healthcare records in a shared spreadsheet',
        baseScan: clearScan,
      }),
    ).toBe(true)

    const result = await service.escalateIfNeeded({
      text: 'Store patient healthcare records in a shared spreadsheet',
      source: 'user_input',
      baseScan: clearScan,
    })

    expect(llmGatewayService.generateStructuredJson).toHaveBeenCalledOnce()
    expect(result.status).toBe('warning')
    expect(result.maxSeverity).toBe('high')
    expect(result.findings).toHaveLength(1)
  })

  it('merges LLM findings with deterministic hits', async () => {
    const { service } = createService({
      llmResult: {
        findings: [
          {
            severity: 'high',
            category: 'secrets',
            spanStart: 0,
            spanEnd: 7,
            quote: 'api_key',
            explanation: 'Confirmed credential-like token.',
            recommendedAction: 'require_confirmation',
          },
        ],
      },
    })

    const result = await service.escalateIfNeeded({
      text: 'api_key=sk-test',
      source: 'user_input',
      baseScan: warningScan,
    })

    expect(result.findings).toHaveLength(2)
    expect(result.maxSeverity).toBe('high')
  })

  it('fails soft to the deterministic scan when LLM escalation throws', async () => {
    const { service, observability } = createService({
      llmError: new Error('provider down'),
    })

    const result = await service.escalateIfNeeded({
      text: 'api_key=sk-test',
      source: 'user_input',
      baseScan: warningScan,
    })

    expect(result).toEqual(warningScan)
    expect(
      observability.events.some(
        (event) => event.name === 'shield_llm_escalation_failed',
      ),
    ).toBe(true)
  })
})
