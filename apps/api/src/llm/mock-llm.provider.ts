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
      request.taskName === 'artifacts/executive_summary/v1' ||
      request.taskName === 'artifacts/executive_summary/v2'
    ) {
      return JSON.stringify(this.createExecutiveSummaryResponse(request))
    }

    if (request.taskName === 'artifacts/prd/v1' || request.taskName === 'artifacts/prd/v2') {
      return JSON.stringify(this.createPrdResponse(request))
    }

    if (
      request.taskName === 'artifacts/development_prompt/v1' ||
      request.taskName === 'artifacts/development_prompt/v2'
    ) {
      return JSON.stringify(this.createDevelopmentPromptResponse(request))
    }

    if (request.taskName === 'shield/llm_classifier/v1') {
      return JSON.stringify(this.createShieldClassifierResponse(request))
    }

    if (request.taskName === 'chunk_summary/v1') {
      return JSON.stringify(this.createChunkSummaryResponse(request))
    }

    return JSON.stringify({
      summary: `Mock response for ${request.taskName}`,
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
    ].slice(0, 7)

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

  private createExecutiveSummaryResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const draftRun = payload.draftRun ?? {}
    const moderatorSynthesis = payload.moderatorSynthesis ?? {}

    return {
      productIdea: String(draftRun.idea?.rawIdea ?? 'The submitted product idea').slice(
        0,
        2_000,
      ),
      targetUsers: moderatorSynthesis.targetUsers ?? ['Founders'],
      coreValueProposition:
        moderatorSynthesis.proposedSolution ??
        'Generate validated product planning artifacts from a raw idea in minutes.',
      mainDifferentiator:
        'A structured non-chat pipeline with isolated agents and human approval.',
      mvpRecommendation:
        'Continue with the prompt-driven local flow and validate artifact usefulness.',
      topRisks: (moderatorSynthesis.risks ?? []).slice(0, 5),
      recommendation: 'go',
    }
  }

  private createPrdResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const moderatorSynthesis = payload.moderatorSynthesis ?? {}

    return {
      overview:
        moderatorSynthesis.proposedSolution ??
        'Create a structured planning workflow that turns ideas into artifacts.',
      goals: [
        'Create a repeatable idea-to-artifacts workflow.',
        'Keep execution structured and schema-validated.',
        'Protect the pipeline with Shield checks.',
      ],
      nonGoals: moderatorSynthesis.nonGoals ?? [],
      userPersonas: moderatorSynthesis.targetUsers ?? ['Founders'],
      userJourneys: [
        'User submits a raw idea and target audience.',
        'System scans input and triages the draft.',
        'User reviews metadata and selected agents.',
        'System executes prompt-driven agents and produces artifacts.',
      ],
      functionalRequirements: [
        'Submit idea draft.',
        'Display Shield findings with highlighted spans.',
        'Allow triage metadata edits.',
        'Allow selected agent edits.',
        'Generate Executive Summary, PRD, and Development Prompt.',
      ],
      nonFunctionalRequirements: [
        'Validate all generated objects with shared schemas.',
        'Record prompt version and model metadata for generated outputs.',
      ],
      mvpScope: moderatorSynthesis.mvpScope ?? ['Prompt-driven planning flow'],
      futureScope: [
        'Temporal orchestration',
        'Real provider adapters',
        'SSE artifact streaming',
      ],
      securityConsiderations: [
        'Treat user input as untrusted.',
        'Keep Shield findings separate from general product reasoning.',
      ],
      successMetrics: [
        'Draft run completion rate.',
        'Artifact copy/export rate.',
        'User approval rate after Human Review.',
      ],
      openQuestions: moderatorSynthesis.openQuestions ?? [],
      screensOrViews: [
        'Idea submission screen',
        'Human review screen',
        'Pipeline progress view',
        'Artifact viewer',
        'Development Prompt copy panel',
      ],
      userStories: [
        'As a founder, I want to submit a product idea so that I can receive a structured plan.',
        'As a builder, I want a detailed development prompt so that I can implement a web app in Cursor.',
        'As a reviewer, I want gaps and additions called out so that I can improve the idea before build.',
      ],
      acceptanceCriteria: [
        'PRD includes screens, user stories, and acceptance criteria.',
        'Development Prompt includes buildTodos and copyPasteBrief.',
        'All generated artifacts validate against shared schemas.',
      ],
    }
  }

  private createDevelopmentPromptResponse(request: LlmProviderRequest) {
    const payload = this.extractPayload(request)
    const completedPrd = payload.completedPrd ?? {}
    const targetTool = payload.targetTool ?? 'cursor'
    const toolSpecificGuidance = Array.isArray(payload.toolSpecificGuidance)
      ? payload.toolSpecificGuidance
      : []

    return {
      targetTool,
      productSummary:
        completedPrd.overview ??
        'Build the approved AI War Room product described by the PRD.',
      technicalStack: ['Vite', 'React', 'TypeScript', 'NestJS', 'Fastify', 'Zod'],
      architectureOverview:
        'Use a monorepo with web, api, and shared schema packages. Route all model calls through the LLM gateway.',
      requiredModules: [
        'Idea submission UI',
        'Human Review Screen',
        'Runs API',
        'Prompt-driven agent pipeline',
        'Artifact viewer',
      ],
      dataModel: [
        'DraftRun',
        'AgentExecutionResult',
        'ModeratorSynthesis',
        'Artifact',
      ],
      apiRequirements: [
        'POST /api/runs/draft',
        'POST /api/runs/mock-pipeline',
        'GET /api/runs/capabilities',
      ],
      uiRequirements: [
        'Show agent step statuses.',
        'Render generated artifacts after execution.',
        'Keep Shield warnings compact and contextual.',
      ],
      securityConstraints: completedPrd.securityConsiderations ?? [
        'Treat user input as untrusted.',
      ],
      testingRequirements: [
        'Validate prompt-driven pipeline response schema.',
        'Test Shield detection and agent routing.',
        'Run build, lint, typecheck, and tests before committing.',
      ],
      implementationOrder: [
        ...(completedPrd.functionalRequirements ?? []).slice(0, 5),
        'Verify generated artifacts with schema tests and runtime checks.',
      ],
      outOfScope: completedPrd.nonGoals ?? [],
      toolSpecificGuidance,
      buildTodos: [
        {
          title: 'Scaffold the web app',
          details:
            'Create the Vite + React + TypeScript shell, routing, and base layout for MVP screens.',
          acceptanceCheck: 'Local app boots and renders the home route.',
          suggestedFiles: ['apps/web/src/main.tsx', 'apps/web/src/App.tsx'],
        },
        {
          title: 'Define shared schemas',
          details:
            'Encode the PRD entities as Zod schemas and shared TypeScript types.',
          acceptanceCheck: 'Fixture objects parse successfully against the new schemas.',
          suggestedFiles: ['packages/schemas/src'],
        },
        {
          title: 'Build primary screens',
          details:
            'Implement the screens from screenMap with empty/loading/error states.',
          acceptanceCheck: 'Each listed screen is reachable in the UI.',
          suggestedFiles: ['apps/web/src'],
        },
        {
          title: 'Wire MVP APIs',
          details:
            'Implement the API requirements needed for the core user journeys.',
          acceptanceCheck: 'Happy-path endpoints return schema-valid JSON.',
          suggestedFiles: ['apps/api/src'],
        },
        {
          title: 'Add Development Prompt export UX',
          details:
            'Surface copyPasteBrief and buildTodos so a builder can paste into Cursor.',
          acceptanceCheck: 'User can copy the brief in one click from the artifact view.',
          suggestedFiles: ['apps/web/src/App.tsx'],
        },
        {
          title: 'Add verification gates',
          details:
            'Add tests and local checks covering the PRD acceptance criteria.',
          acceptanceCheck: 'Targeted tests pass for the MVP journey.',
          suggestedFiles: ['apps/api/src', 'apps/web/src'],
        },
      ],
      screenMap: completedPrd.screensOrViews ?? [
        'Idea submission',
        'Human review',
        'Pipeline progress',
        'Artifact viewer',
      ],
      copyPasteBrief: [
        `Build this product: ${completedPrd.overview ?? 'Approved MVP web application.'}`,
        `Personas: ${(completedPrd.userPersonas ?? ['Founders']).join(', ')}`,
        `MVP scope: ${(completedPrd.mvpScope ?? []).join('; ')}`,
        `Screens: ${(completedPrd.screensOrViews ?? []).join('; ')}`,
        'Stack: Vite, React, TypeScript, NestJS, Fastify, Zod.',
        'Implement buildTodos one by one. After each todo, run the acceptanceCheck before continuing.',
        'Keep scope limited to the PRD; put marketplace/chat features in outOfScope.',
      ].join('\n\n'),
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
