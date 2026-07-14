import { Injectable } from '@nestjs/common'
import type {
  LlmProvider,
  LlmProviderRequest,
  LlmProviderResponse,
} from './llm.types.js'
import {
  createUsage,
  estimateMessageTokens,
  estimateTokens,
} from './llm.utils.js'

const mockJsonPrefix = 'MOCK_JSON:'

@Injectable()
export class MockLlmProvider implements LlmProvider {
  readonly providerId = 'mock' as const

  async completeJson(
    request: LlmProviderRequest,
  ): Promise<LlmProviderResponse> {
    const rawText = this.resolveMockJson(request)

    return {
      rawText,
      usage: createUsage(
        estimateMessageTokens(request.messages),
        estimateTokens(rawText),
      ),
      providerId: this.providerId,
      model: request.model,
    }
  }

  private resolveMockJson(request: LlmProviderRequest) {
    const explicitMock = [...request.messages]
      .reverse()
      .map((message) => message.content)
      .find((content) => content.includes(mockJsonPrefix))

    if (explicitMock) {
      return explicitMock.slice(
        explicitMock.indexOf(mockJsonPrefix) + mockJsonPrefix.length,
      )
    }

    if (request.taskName === 'triage/v1') {
      return JSON.stringify(this.createTriageResponse(request))
    }

    if (request.taskName.startsWith('agents/')) {
      return JSON.stringify(this.createAgentResponse(request))
    }

    if (request.taskName === 'moderator/v1' || request.taskName === 'moderator/v2') {
      return JSON.stringify(this.createModeratorResponse(request))
    }

    if (
      request.taskName === 'artifacts/idea_brief/v1' ||
      request.taskName === 'artifacts/executive_summary/v1' ||
      request.taskName === 'artifacts/executive_summary/v2'
    ) {
      return JSON.stringify(this.createIdeaBriefResponse(request))
    }

    if (
      request.taskName === 'artifacts/master_prompt/v1' ||
      request.taskName === 'artifacts/development_prompt/v1' ||
      request.taskName === 'artifacts/development_prompt/v2'
    ) {
      return JSON.stringify(this.createMasterPromptResponse(request))
    }

    if (request.taskName === 'artifacts/ui_prompt/v1') {
      return JSON.stringify(this.createUiPromptResponse(request))
    }

    if (
      request.taskName === 'artifacts/todo_list/v1' ||
      request.taskName === 'artifacts/prd/v1' ||
      request.taskName === 'artifacts/prd/v2'
    ) {
      return JSON.stringify(this.createTodoListResponse(request))
    }

    if (request.taskName === 'idea_explain/v1') {
      return JSON.stringify(this.createIdeaExplainResponse(request))
    }

    if (request.taskName === 'shield/llm_classifier/v1') {
      return JSON.stringify(this.createShieldClassifierResponse(request))
    }

    if (request.taskName === 'chunk_summary/v1') {
      return JSON.stringify(this.createChunkSummaryResponse(request))
    }

    return JSON.stringify({
      summary: `Mock response for ${request.taskName}`,
      explanation: `Mock explanation for ${request.taskName}`,
    })
  }

  private createTriageResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const text = [
      payload.idea?.rawIdea,
      payload.idea?.targetAudience,
      ...(payload.idea?.strategicGoals ?? []),
      ...(payload.idea?.technicalPreferences ?? []),
      ...(payload.idea?.constraints ?? []),
    ]
      .join(' ')
      .toLowerCase()
    const securitySensitive =
      payload.shieldMaxSeverity === 'high' ||
      /security|appsec|auth|payment|fintech|compliance|privacy/.test(text)
    const mobileDomain = /mobile|ios|android|react native/.test(text)
    const complexity = /enterprise|multi-tenant|temporal|orchestrator|scale/.test(
      text,
    )
      ? 'high'
      : text.length > 600
        ? 'medium'
        : 'low'
    const recommendedAgents = [
      'product_manager',
      'critic',
      'moderator',
      ...(securitySensitive ? ['security_expert'] : []),
      ...(complexity === 'high' ? ['software_architect'] : []),
      ...(/market|competitor|pricing|gtm|go-to-market/.test(text)
        ? ['market_researcher']
        : []),
      ...(mobileDomain ? ['mobile_ux_expert'] : []),
      ...(/ui\/ux|ui ux|\bui\b|\bux\b|design system|wireframe|interface|frontend|landing|dashboard|visual design/.test(
        text,
      )
        ? ['ui_ux_expert']
        : []),
    ].slice(0, 8)

    return {
      domain: mobileDomain ? 'mobile' : securitySensitive ? 'security' : 'software',
      subdomain: securitySensitive ? 'Security-sensitive software' : 'SaaS planning',
      complexity,
      marketConfidence: /new market|unknown|validate|competitor/.test(text)
        ? 'low'
        : 'medium',
      securitySensitivity: securitySensitive ? 'high' : 'medium',
      recommendedRunMode: recommendedAgents.length > 4 ? 'deep' : 'standard',
      recommendedAgents,
      estimatedDurationSeconds: recommendedAgents.length > 4 ? 150 : 60,
      estimatedMaxCostUsd: recommendedAgents.length > 4 ? 1.25 : 0.5,
      reasoningSummary:
        'Mock provider response generated through the prompt-driven LLM gateway.',
    }
  }

  private createAgentResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const ideaRaw = payload.draftRun?.idea?.rawIdea ?? 'the submitted idea'
    const idea =
      typeof ideaRaw === 'string' && ideaRaw.length > 240
        ? `${ideaRaw.slice(0, 239)}…`
        : ideaRaw
    const targetAudience =
      payload.draftRun?.idea?.targetAudience ?? 'early adopters'
    const role = request.taskName.split('/')[1] ?? 'agent'

    return {
      summary: `${this.formatRole(role)} produced a full breakdown of "${idea}" for ${targetAudience}. The review covers product thesis, users, MVP boundaries, missing pieces, concrete additions, and build-facing notes so later artifacts can become an implementation-ready web app brief rather than a short approval.`,
      strengths: [
        'The workflow is structured and non-chat by design.',
        'Human review reduces the risk of expensive incorrect execution.',
        'Schema-validated outputs keep downstream PRD and Development Prompt generation consistent.',
      ],
      weaknesses: [
        'The current response is generated by the local mock provider.',
        'Real model quality still needs validation with provider adapters.',
      ],
      risks: [
        'Artifact quality can look convincing before assumptions are validated.',
        'A thin idea brief can produce under-specified build todos.',
      ],
      recommendations: [
        'Keep schema validation mandatory for every agent response.',
        'Track prompt version and model metadata for each output.',
        'Expand the idea with explicit screens, entities, and non-goals before deep build work.',
        'Prefer regenerating agents after major idea edits.',
      ],
      ideaGaps: [
        'Primary user journeys are not fully spelled out as step-by-step flows.',
        'MVP must-have features need clearer prioritization versus later phases.',
        'Acceptance criteria for the first web release are incomplete.',
        'Data entities and ownership boundaries need more detail.',
      ],
      additions: [
        'Add an MVP feature checklist with must-have versus later items.',
        'Add screen/view inventory for the first web release.',
        'Add success metrics and validation questions for the target audience.',
        'Add non-goals so implementers do not invent scope.',
        'Add a short technical constraints section (stack, hosting, auth).',
      ],
      mustHaveFeatures: [
        'Core create/read flow for the primary user journey.',
        'Persistent storage for the main domain entities.',
        'Basic navigation across the MVP screens.',
        'Error and empty states for the main forms/lists.',
        'Export or copy of the final implementation brief.',
      ],
      buildNotes: [
        'Start with schemas and primary screens before secondary polish.',
        'Keep API contracts schema-validated and aligned with the PRD entities.',
        'Break implementation into small todos with acceptance checks.',
        'Defer marketplace/chat-style features until the MVP journey works end-to-end.',
      ],
      roleSpecificInsights: {
        role,
        providerMode: 'mock',
      },
    }
  }

  private createModeratorResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const draftRun = payload.draftRun ?? {}
    const approvedTriage = payload.approvedTriage ?? {}
    const chunkSummaries = Array.isArray(payload.chunkSummaries)
      ? payload.chunkSummaries
      : []
    const agentCount =
      typeof payload.agentCount === 'number'
        ? payload.agentCount
        : chunkSummaries.length

    return {
      executivePositioning:
        'AI War Room turns raw product ideas into reviewed, build-ready artifacts through a structured council workflow.',
      targetUsers: [
        draftRun.idea?.targetAudience ?? 'Founders',
        'Technical product builders',
      ],
      coreProblem:
        'Builders need a repeatable path from rough idea to coherent PRD and implementation prompt.',
      proposedSolution:
        'Use Shield, approved triage, isolated specialists, and Moderator synthesis before generating final artifacts.',
      mvpScope: [
        'Idea submission',
        'Shield input scan',
        'Human Review Screen',
        'Prompt-driven isolated agent analysis',
        'Moderator synthesis',
        'Executive Summary, PRD, and Development Prompt',
      ],
      nonGoals: [
        'Custom user-defined agents',
        'Agent marketplace',
        'Open-ended multi-agent chat',
      ],
      keyDecisions: [
        `Use ${approvedTriage.recommendedRunMode ?? 'standard'} run mode for this draft.`,
        `Execute ${agentCount} non-moderator agents in isolation.`,
        'Keep Shield as a background security layer.',
      ],
      risks: chunkSummaries
        .flatMap(
          (summary: { topRisks?: string[] }) => summary.topRisks ?? [],
        )
        .slice(0, 10),
      openQuestions: [
        'Which artifact format should users export first?',
        'What quality signal proves that a generated development prompt is build-ready?',
      ],
      additionsToIdea: [
        'Add an explicit MVP feature checklist and non-goals section.',
        'Add screen inventory and primary user journeys.',
        'Add success metrics and validation questions for the target audience.',
        'Add technical constraints for stack, auth, and data persistence.',
      ],
      mvpBuildSequence: [
        'Clarify idea gaps and additions from specialist agents.',
        'Lock MVP screens, entities, and acceptance criteria in the PRD.',
        'Generate a Cursor-ready Development Prompt with buildTodos.',
        'Implement the web app module-by-module with verification gates.',
      ],
      artifactGenerationBrief: {
        source: 'mock_prompt_driven_moderator',
        agentCount,
        chunkSummaryCount: chunkSummaries.length,
        shieldStatus: draftRun.shieldScan?.status ?? 'clear',
      },
    }
  }

  private createIdeaBriefResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const draftRun = payload.draftRun ?? {}
    const moderatorSynthesis = payload.moderatorSynthesis ?? {}
    const idea = String(draftRun.idea?.rawIdea ?? 'The submitted product idea')

    return {
      summaryForUser:
        moderatorSynthesis.executivePositioning ??
        'Expanded idea brief ready for discussion before master prompt and todo generation.',
      expandedIdea: [
        idea.slice(0, 8_000),
        '',
        `Core problem: ${moderatorSynthesis.coreProblem ?? 'Needs clearer problem framing.'}`,
        `Proposed solution: ${moderatorSynthesis.proposedSolution ?? 'Build a structured web app from the idea.'}`,
      ].join('\n'),
      analysis:
        'Keep schema-validated council outputs. Discuss tools and AI choices with the founder before locking the build prompt.',
      acceptRecommendations: moderatorSynthesis.mvpScope?.slice(0, 6) ?? [
        'Keep the primary MVP modules',
        'Keep human review before expensive generation',
      ],
      applyRecommendations: moderatorSynthesis.additionsToIdea?.slice(0, 6) ?? [
        'Add screen inventory',
        'Add success metrics and non-goals',
      ],
      toolsToUse: [
        {
          name: 'Vite + React + TypeScript',
          why: 'Fast local UI development for the web app.',
          required: true,
        },
        {
          name: 'NestJS + Fastify',
          why: 'Typed API surface for the planning backend.',
          required: true,
        },
        {
          name: 'Zod',
          why: 'Shared validation between clients and APIs.',
          required: true,
        },
        {
          name: 'PostgreSQL + Redis',
          why: 'Durable artifacts and stream replay.',
          required: false,
        },
      ],
      aiChoices: [
        {
          name: 'OpenRouter / GPT-class model',
          role: 'Planning and long-form prompt generation',
          why: 'Strong structured JSON and markdown generation.',
        },
        {
          name: 'Cursor Agent / Composer',
          role: 'Implementation against the master prompt and todos',
          why: 'File-scoped coding with acceptance checks.',
        },
      ],
      openQuestions: moderatorSynthesis.openQuestions ?? [],
    }
  }

  private createMasterPromptResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const brief = payload.approvedIdeaBrief ?? {}
    const targetTool = payload.targetTool ?? 'cursor'

    return {
      title: 'Master build prompt',
      targetTool,
      markdownBody: [
        '# Product brief',
        '',
        brief.summaryForUser ?? 'Build the approved product.',
        '',
        '## Expanded idea',
        '',
        brief.expandedIdea ?? 'See approved idea brief.',
        '',
        '## Analysis',
        '',
        brief.analysis ?? 'Follow accept/apply recommendations.',
        '',
        '## Tools',
        '',
        ...(Array.isArray(brief.toolsToUse)
          ? brief.toolsToUse.map(
              (tool: { name?: string; why?: string }) =>
                `- ${tool.name}: ${tool.why}`,
            )
          : ['- Vite/React/TypeScript', '- NestJS/Fastify', '- Zod']),
        '',
        '## Implementation principles',
        '',
        '- Build in small verified steps.',
        '- Validate schemas on every API boundary.',
        '- Prefer local-first MVP.',
      ].join('\n'),
    }
  }

  private createUiPromptResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const brief = payload.approvedIdeaBrief ?? {}
    const targetTool = payload.targetTool ?? 'cursor'

    return {
      title: 'UI/UX design prompt',
      targetTool,
      markdownBody: [
        '# UI/UX brief',
        '',
        brief.summaryForUser ?? 'Design the approved product interface.',
        '',
        '## Product context',
        '',
        brief.expandedIdea ?? 'See approved idea brief.',
        '',
        '## Screens',
        '',
        '- Home / landing',
        '- Primary working surface',
        '- Results / detail view',
        '',
        '## Components',
        '',
        '- Header with brand',
        '- Form and CTA group',
        '- Empty / loading / error states',
        '',
        '## Visual system',
        '',
        '- Defined color tokens and typography scale',
        '- Responsive layout with a single hero composition',
      ].join('\n'),
    }
  }

  private createTodoListResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const brief = payload.approvedIdeaBrief ?? {}

    return {
      overview:
        brief.summaryForUser ??
        'Step-by-step build order derived from the approved idea brief.',
      items: [
        {
          step: 1,
          title: 'Scaffold the web app shell',
          details: 'Create Vite + React + TypeScript shell with routing.',
          acceptanceCheck: 'App boots and shows home route.',
          suggestedFiles: ['apps/web/src/App.tsx'],
        },
        {
          step: 2,
          title: 'Define shared schemas',
          details: 'Encode core entities as Zod schemas.',
          acceptanceCheck: 'Fixtures parse against schemas.',
          suggestedFiles: ['packages/schemas/src'],
        },
        {
          step: 3,
          title: 'Implement primary screens',
          details: 'Build must-have UI flows from the idea brief.',
          acceptanceCheck: 'Primary journey screens are reachable.',
          suggestedFiles: ['apps/web/src'],
        },
        {
          step: 4,
          title: 'Wire MVP APIs',
          details: 'Implement required endpoints with schema validation.',
          acceptanceCheck: 'Happy-path endpoints return valid JSON.',
          suggestedFiles: ['apps/api/src'],
        },
        {
          step: 5,
          title: 'Add verification gates',
          details: 'Cover acceptance checks with tests.',
          acceptanceCheck: 'Targeted tests pass.',
          suggestedFiles: ['apps/api/src', 'apps/web/src'],
        },
      ],
    }
  }

  private createIdeaExplainResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const brief = payload.ideaBrief ?? {}
    const question = payload.question ?? 'Explain the idea.'

    return {
      explanation: [
        `Питання: ${question}`,
        '',
        `Коротко: ${brief.summaryForUser ?? 'Idea brief'}`,
        '',
        `Аналіз: ${brief.analysis ?? 'N/A'}`,
        '',
        `Прийняти: ${(brief.acceptRecommendations ?? []).slice(0, 5).join('; ')}`,
        `Застосувати: ${(brief.applyRecommendations ?? []).slice(0, 5).join('; ')}`,
      ].join('\n'),
    }
  }

  private createChunkSummaryResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const agentOutputs = Array.isArray(payload.agentOutputs)
      ? payload.agentOutputs
      : []

    return agentOutputs.map(
      (agent: {
        agentRole?: string
        output?: {
          summary?: string
          strengths?: string[]
          weaknesses?: string[]
          risks?: string[]
          recommendations?: string[]
        }
      }) => ({
        agentRole: agent.agentRole ?? 'critic',
        summary: agent.output?.summary ?? 'Mock compressed agent summary.',
        topInsights: [
          ...(agent.output?.strengths ?? []).slice(0, 2),
          ...(agent.output?.recommendations ?? []).slice(0, 2),
        ].slice(0, 5),
        topRisks: (agent.output?.risks ?? []).slice(0, 5),
        conflicts:
          agent.output?.weaknesses?.[0] && agent.output?.strengths?.[0]
            ? [
                `${agent.agentRole}: strengths vs weaknesses noted in mock compression.`,
              ]
            : [],
        recommendedDecisions: (agent.output?.recommendations ?? []).slice(0, 5),
        securityNotes: [],
      }),
    )
  }

  private createShieldClassifierResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const deterministicFindings = Array.isArray(payload.deterministicFindings)
      ? payload.deterministicFindings
      : []
    const text = typeof payload.text === 'string' ? payload.text : ''

    if (deterministicFindings.length === 0 && !/exfiltrate|weapon|ransomware/i.test(text)) {
      return {
        findings: [],
        rationale: 'Mock Layer 2: no residual risk beyond deterministic clear.',
      }
    }

    const primary = deterministicFindings[0] as
      | {
          severity?: string
          category?: string
          recommendedAction?: string
          explanation?: string
          span?: { start?: number; end?: number; quote?: string }
        }
      | undefined

    return {
      findings: primary
        ? [
            {
              severity: primary.severity ?? 'medium',
              category: primary.category ?? 'other',
              spanStart: primary.span?.start,
              spanEnd: primary.span?.end,
              quote: primary.span?.quote,
              explanation:
                primary.explanation ??
                'Mock Layer 2 confirmed the deterministic finding.',
              recommendedAction: primary.recommendedAction ?? 'warn',
            },
          ]
        : [
            {
              severity: 'high',
              category: 'malicious_intent',
              explanation:
                'Mock Layer 2 flagged high-risk domain language for human review.',
              recommendedAction: 'require_confirmation',
            },
          ],
      rationale: 'Mock Layer 2 escalation response.',
    }
  }

  private extractPayload(request: LlmProviderRequest) {
    const content = [...request.messages]
      .reverse()
      .map((message) => message.content)
      .find((message) => message.includes('INPUT_JSON:'))

    if (!content) {
      return {}
    }

    try {
      return JSON.parse(content.slice(content.indexOf('INPUT_JSON:') + 11)) as {
        idea?: {
          rawIdea?: string
          targetAudience?: string
          strategicGoals?: string[]
          technicalPreferences?: string[]
          constraints?: string[]
        }
        draftRun?: {
          idea?: {
            rawIdea?: string
            targetAudience?: string
          }
          shieldScan?: {
            status?: string
          }
        }
        shieldMaxSeverity?: string
        [key: string]: any
      }
    } catch {
      return {}
    }
  }

  private formatRole(role: string) {
    return role
      .split('_')
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(' ')
  }
}
