import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  type CreateRunRequest,
  type DraftRun,
  triageResultSchema,
} from '@ai-war-room/schemas'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { triagePromptV1 } from '../prompts/triage.prompts.js'

const promptInjectionPattern =
  /ignore (all )?(previous|prior) instructions|system prompt|developer message/i

const secretPattern =
  /(sk-[a-z0-9_-]{12,}|api[_-]?key|secret|password|token)/i

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class TriageService {
  constructor(private readonly llmGatewayService: LlmGatewayService) {}

  scanInput(rawIdea: string): DraftRun['shieldScan'] {
    const findings: DraftRun['shieldScan']['findings'] = []
    const injectionMatch = promptInjectionPattern.exec(rawIdea)
    const secretMatch = secretPattern.exec(rawIdea)

    if (injectionMatch) {
      findings.push({
        findingId: createId('finding'),
        severity: 'high',
        category: 'prompt_injection',
        source: 'user_input',
        span: {
          start: injectionMatch.index,
          end: injectionMatch.index + injectionMatch[0].length,
          quote: injectionMatch[0],
        },
        explanation:
          'The input appears to contain instructions that could override the planning pipeline.',
        recommendedAction: 'require_confirmation',
      })
    }

    if (secretMatch) {
      findings.push({
        findingId: createId('finding'),
        severity: 'medium',
        category: 'secrets',
        source: 'user_input',
        span: {
          start: secretMatch.index,
          end: secretMatch.index + secretMatch[0].length,
          quote: secretMatch[0],
        },
        explanation:
          'The input may contain a secret or credential-like value and should be reviewed.',
        recommendedAction: 'warn',
      })
    }

    const maxSeverity = findings.some((finding) => finding.severity === 'high')
      ? 'high'
      : findings.length > 0
        ? 'medium'
        : 'none'

    return {
      scanId: createId('scan'),
      status: findings.length > 0 ? 'warning' : 'clear',
      maxSeverity,
      findings,
    }
  }

  async triageIdea(
    request: CreateRunRequest,
    shieldScan: DraftRun['shieldScan'],
  ): Promise<DraftRun['triage']> {
    const fallback = this.createFallbackTriage(request, shieldScan.maxSeverity)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: triagePromptV1.version,
      schema: triageResultSchema,
      messages: [
        {
          role: 'system',
          content: triagePromptV1.system,
        },
        {
          role: 'user',
          content: `${triagePromptV1.userTemplate}${JSON.stringify({
            idea: request.idea,
            shieldStatus: shieldScan.status,
            shieldMaxSeverity: shieldScan.maxSeverity,
            shieldFindingCategories: shieldScan.findings.map(
              (finding) => finding.category,
            ),
          })}`,
        },
      ],
      fallback,
    })

    return result.value
  }

  private createFallbackTriage(
    request: CreateRunRequest,
    maxShieldSeverity: DraftRun['shieldScan']['maxSeverity'],
  ): DraftRun['triage'] {
    const text = [
      request.idea.rawIdea,
      request.idea.targetAudience ?? '',
      ...request.idea.strategicGoals,
      ...request.idea.technicalPreferences,
      ...request.idea.constraints,
    ]
      .join(' ')
      .toLowerCase()
    const securitySensitive =
      maxShieldSeverity === 'high' ||
      /security|appsec|auth|payment|fintech|compliance|privacy/.test(text)
    const mobileDomain = /mobile|ios|android|react native/.test(text)
    const complexity = /enterprise|multi-tenant|temporal|orchestrator|scale/.test(
      text,
    )
      ? 'high'
      : text.length > 600
        ? 'medium'
        : 'low'
    const recommendedAgents: DraftRun['selectedAgents'] = [
      'product_manager',
      'critic',
      'moderator',
    ]

    if (securitySensitive) {
      recommendedAgents.push('security_expert')
    }

    if (complexity === 'high') {
      recommendedAgents.push('software_architect')
    }

    if (/market|competitor|pricing|gtm|go-to-market/.test(text)) {
      recommendedAgents.push('market_researcher')
    }

    if (mobileDomain) {
      recommendedAgents.push('mobile_ux_expert')
    }

    const uniqueAgents = [...new Set(recommendedAgents)].slice(0, 7)

    return {
      domain: mobileDomain ? 'mobile' : securitySensitive ? 'security' : 'software',
      subdomain: securitySensitive ? 'Security-sensitive software' : 'SaaS planning',
      complexity,
      marketConfidence: /new market|unknown|validate|competitor/.test(text)
        ? 'low'
        : 'medium',
      securitySensitivity: securitySensitive ? 'high' : 'medium',
      recommendedRunMode: uniqueAgents.length > 4 ? 'deep' : 'standard',
      recommendedAgents: uniqueAgents,
      estimatedDurationSeconds: uniqueAgents.length > 4 ? 150 : 60,
      estimatedMaxCostUsd: uniqueAgents.length > 4 ? 1.25 : 0.5,
      reasoningSummary:
        'Fallback triage generated locally after gateway validation failure.',
    }
  }
}
