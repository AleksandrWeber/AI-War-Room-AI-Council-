import { Injectable } from '@nestjs/common'
import {
  type CreateRunRequest,
  type DraftRun,
  triageResultSchema,
} from '@ai-war-room/schemas'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { triagePromptV1 } from '../prompts/triage.prompts.js'
import { AdvancedShieldService } from '../shield/advanced-shield.service.js'

@Injectable()
export class TriageService {
  constructor(
    private readonly llmGatewayService: LlmGatewayService,
    private readonly advancedShieldService: AdvancedShieldService,
  ) {}

  scanInput(input: {
    workspaceId: string
    rawIdea: string
  }): Promise<DraftRun['shieldScan']> {
    return this.advancedShieldService.scanText({
      workspaceId: input.workspaceId,
      text: input.rawIdea,
      source: 'user_input',
    })
  }

  async triageIdea(
    request: CreateRunRequest,
    shieldScan: DraftRun['shieldScan'],
  ): Promise<DraftRun['triage']> {
    const fallback = this.createFallbackTriage(request, shieldScan.maxSeverity)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: triagePromptV1.version,
      schema: triageResultSchema,
      workspaceId: request.workspaceId,
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
