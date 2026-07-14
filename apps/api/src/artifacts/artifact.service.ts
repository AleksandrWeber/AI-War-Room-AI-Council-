import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  type AgentExecutionResult,
  type Artifact,
  type DevelopmentPromptTargetTool,
  type DraftRun,
  type IdeaBrief,
  type MasterPrompt,
  type ModeratorSynthesis,
  type TodoList,
  type UiPrompt,
  artifactSchema,
  ideaBriefSchema,
  masterPromptSchema,
  todoListSchema,
  uiPromptSchema,
} from '@ai-war-room/schemas'
import { LlmGatewayService } from '../llm/llm-gateway.service.js'
import { truncateText } from '../llm/llm.utils.js'
import { artifactPrompts } from '../prompts/artifact.prompts.js'
import {
  getDevelopmentPromptSystemAddon,
  getDevelopmentPromptToolGuidance,
} from './development-prompt-targets.js'

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}

@Injectable()
export class ArtifactService {
  constructor(private readonly llmGatewayService: LlmGatewayService) {}

  /** Phase A: expanded idea for human discussion. */
  async generateIdeaBrief(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    agentOutputs: AgentExecutionResult[]
    completedAt: string
  }): Promise<Artifact & { artifact: { artifactType: 'idea_brief'; content: IdeaBrief } }> {
    const prompt = artifactPrompts.idea_brief
    const fallback = this.createFallbackIdeaBrief(input)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: ideaBriefSchema,
      workspaceId: input.draftRun.workspaceId,
      messages: this.createMessages(prompt.system, prompt.userTemplate, {
        draftRun: input.draftRun,
        moderatorSynthesis: input.moderatorSynthesis,
        agentOutputs: input.agentOutputs.map((agent) => ({
          agentRole: agent.agentRole,
          output: agent.output,
        })),
      }),
      fallback,
    })

    return artifactSchema.parse({
      metadata: this.createMetadata({
        input,
        artifactType: 'idea_brief',
        promptVersion: prompt.version,
        providerId: result.providerId,
        model: result.model,
        validationStatus: result.validationStatus,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        content: result.value,
      }),
      artifact: {
        artifactType: 'idea_brief',
        content: result.value,
      },
    }) as Artifact & { artifact: { artifactType: 'idea_brief'; content: IdeaBrief } }
  }

  /** Phase B1: master .md prompt after idea approval. */
  async generateMasterPromptArtifact(input: {
    draftRun: DraftRun
    approvedIdeaBrief: IdeaBrief
    completedAt: string
    developmentPromptTargetTool?: DevelopmentPromptTargetTool
  }) {
    return this.generateMasterPrompt({
      draftRun: input.draftRun,
      approvedIdeaBrief: input.approvedIdeaBrief,
      completedAt: input.completedAt,
      targetTool: input.developmentPromptTargetTool ?? 'cursor',
    })
  }

  /** Phase B1b: UI/UX .md prompt after idea approval. */
  async generateUiPromptArtifact(input: {
    draftRun: DraftRun
    approvedIdeaBrief: IdeaBrief
    completedAt: string
    developmentPromptTargetTool?: DevelopmentPromptTargetTool
  }) {
    return this.generateUiPrompt({
      draftRun: input.draftRun,
      approvedIdeaBrief: input.approvedIdeaBrief,
      completedAt: input.completedAt,
      targetTool: input.developmentPromptTargetTool ?? 'cursor',
    })
  }

  /** Phase B2: todo list derived from approved idea + master prompt. */
  async generateTodoListArtifact(input: {
    draftRun: DraftRun
    approvedIdeaBrief: IdeaBrief
    masterPrompt: MasterPrompt
    completedAt: string
    developmentPromptTargetTool?: DevelopmentPromptTargetTool
  }) {
    return this.generateTodoList({
      draftRun: input.draftRun,
      approvedIdeaBrief: input.approvedIdeaBrief,
      masterPrompt: input.masterPrompt,
      completedAt: input.completedAt,
      targetTool: input.developmentPromptTargetTool ?? 'cursor',
    })
  }

  /** @deprecated Prefer generateMasterPromptArtifact + generateTodoListArtifact. */
  async generatePromptAndTodo(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    approvedIdeaBrief: IdeaBrief
    previousIdeaBriefArtifact?: Artifact
    completedAt: string
    developmentPromptTargetTool?: DevelopmentPromptTargetTool
  }): Promise<Artifact[]> {
    const targetTool = input.developmentPromptTargetTool ?? 'cursor'
    const masterPrompt = await this.generateMasterPrompt({
      ...input,
      targetTool,
    })
    const todoList = await this.generateTodoList({
      ...input,
      targetTool,
      masterPrompt: masterPrompt.artifact.content,
    })
    const ideaBriefArtifact =
      input.previousIdeaBriefArtifact ??
      artifactSchema.parse({
        metadata: this.createMetadata({
          input,
          artifactType: 'idea_brief',
          promptVersion: 'artifacts/idea_brief/v1',
          providerId: 'mock',
          model: 'approved-idea',
          validationStatus: 'valid',
          inputTokens: 0,
          outputTokens: 0,
          estimatedCostUsd: 0,
          content: input.approvedIdeaBrief,
        }),
        artifact: {
          artifactType: 'idea_brief',
          content: input.approvedIdeaBrief,
        },
      })

    return [ideaBriefArtifact, masterPrompt, todoList]
  }

  private async generateMasterPrompt(input: {
    draftRun: DraftRun
    approvedIdeaBrief: IdeaBrief
    completedAt: string
    targetTool: DevelopmentPromptTargetTool
  }): Promise<Artifact & { artifact: { artifactType: 'master_prompt'; content: MasterPrompt } }> {
    const prompt = artifactPrompts.master_prompt
    const toolGuidance = getDevelopmentPromptToolGuidance(input.targetTool)
    const fallback = this.createFallbackMasterPrompt(input, toolGuidance)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: masterPromptSchema,
      workspaceId: input.draftRun.workspaceId,
      messages: this.createMessages(
        `${prompt.system}\n${getDevelopmentPromptSystemAddon(input.targetTool)}`,
        prompt.userTemplate,
        {
          draftRun: input.draftRun,
          approvedIdeaBrief: input.approvedIdeaBrief,
          targetTool: input.targetTool,
          toolSpecificGuidance: toolGuidance,
        },
      ),
      fallback,
    })
    const content = masterPromptSchema.parse({
      ...result.value,
      targetTool: input.targetTool,
    })

    return artifactSchema.parse({
      metadata: this.createMetadata({
        input,
        artifactType: 'master_prompt',
        promptVersion: prompt.version,
        providerId: result.providerId,
        model: result.model,
        validationStatus: result.validationStatus,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        content,
      }),
      artifact: {
        artifactType: 'master_prompt',
        content,
      },
    }) as Artifact & {
      artifact: { artifactType: 'master_prompt'; content: MasterPrompt }
    }
  }

  private async generateUiPrompt(input: {
    draftRun: DraftRun
    approvedIdeaBrief: IdeaBrief
    completedAt: string
    targetTool: DevelopmentPromptTargetTool
  }): Promise<Artifact & { artifact: { artifactType: 'ui_prompt'; content: UiPrompt } }> {
    const prompt = artifactPrompts.ui_prompt
    const toolGuidance = getDevelopmentPromptToolGuidance(input.targetTool)
    const fallback = this.createFallbackUiPrompt(input, toolGuidance)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: uiPromptSchema,
      workspaceId: input.draftRun.workspaceId,
      messages: this.createMessages(
        `${prompt.system}\n${getDevelopmentPromptSystemAddon(input.targetTool)}`,
        prompt.userTemplate,
        {
          draftRun: input.draftRun,
          approvedIdeaBrief: input.approvedIdeaBrief,
          targetTool: input.targetTool,
          toolSpecificGuidance: toolGuidance,
        },
      ),
      fallback,
    })
    const content = uiPromptSchema.parse({
      ...result.value,
      targetTool: input.targetTool,
    })

    return artifactSchema.parse({
      metadata: this.createMetadata({
        input,
        artifactType: 'ui_prompt',
        promptVersion: prompt.version,
        providerId: result.providerId,
        model: result.model,
        validationStatus: result.validationStatus,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        content,
      }),
      artifact: {
        artifactType: 'ui_prompt',
        content,
      },
    }) as Artifact & {
      artifact: { artifactType: 'ui_prompt'; content: UiPrompt }
    }
  }

  private async generateTodoList(input: {
    draftRun: DraftRun
    approvedIdeaBrief: IdeaBrief
    masterPrompt: MasterPrompt
    completedAt: string
    targetTool: DevelopmentPromptTargetTool
  }): Promise<Artifact & { artifact: { artifactType: 'todo_list'; content: TodoList } }> {
    const prompt = artifactPrompts.todo_list
    const fallback = this.createFallbackTodoList(input)
    const result = await this.llmGatewayService.generateStructuredJson({
      taskName: prompt.version,
      schema: todoListSchema,
      workspaceId: input.draftRun.workspaceId,
      messages: this.createMessages(prompt.system, prompt.userTemplate, {
        draftRun: input.draftRun,
        approvedIdeaBrief: input.approvedIdeaBrief,
        masterPromptTitle: input.masterPrompt.title,
        targetTool: input.targetTool,
      }),
      fallback,
    })

    return artifactSchema.parse({
      metadata: this.createMetadata({
        input,
        artifactType: 'todo_list',
        promptVersion: prompt.version,
        providerId: result.providerId,
        model: result.model,
        validationStatus: result.validationStatus,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        content: result.value,
      }),
      artifact: {
        artifactType: 'todo_list',
        content: result.value,
      },
    }) as Artifact & { artifact: { artifactType: 'todo_list'; content: TodoList } }
  }

  private createMessages(system: string, userTemplate: string, input: unknown) {
    return [
      {
        role: 'system' as const,
        content: system,
      },
      {
        role: 'user' as const,
        content: `${userTemplate}${JSON.stringify(input)}`,
      },
    ]
  }

  private createMetadata(input: {
    input: {
      draftRun: DraftRun
      completedAt: string
    }
    artifactType: Artifact['metadata']['artifactType']
    promptVersion: string
    providerId: string
    model: string
    validationStatus: Artifact['metadata']['validationStatus']
    inputTokens: number
    outputTokens: number
    estimatedCostUsd: number
    content: unknown
  }): Artifact['metadata'] {
    return {
      artifactId: createId('artifact'),
      runId: input.input.draftRun.runId,
      workspaceId: input.input.draftRun.workspaceId,
      artifactType: input.artifactType,
      artifactVersion: 'v1',
      promptVersion: input.promptVersion,
      modelProvider: input.providerId,
      modelName: input.model,
      tokenUsage: {
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
      },
      estimatedCostUsd: input.estimatedCostUsd,
      validationStatus: input.validationStatus,
      shieldStatus: this.scanArtifactContent(input.content),
      createdAt: input.input.completedAt,
    }
  }

  private scanArtifactContent(content: unknown): Artifact['metadata']['shieldStatus'] {
    const text = JSON.stringify(content).toLowerCase()

    return /ignore (all )?(previous|prior) instructions|system prompt|developer message|sk-[a-z0-9_-]{12,}|api[_-]?key|secret|password|token/.test(
      text,
    )
      ? 'warning'
      : 'clear'
  }

  private createFallbackIdeaBrief(input: {
    draftRun: DraftRun
    moderatorSynthesis: ModeratorSynthesis
    agentOutputs: AgentExecutionResult[]
  }): IdeaBrief {
    const ideaSnippet = truncateText(input.draftRun.idea.rawIdea, 2_000)
    const additions = input.agentOutputs.flatMap((agent) => agent.output.additions).slice(0, 8)
    const mustHaves = input.agentOutputs
      .flatMap((agent) => agent.output.mustHaveFeatures)
      .slice(0, 8)

    return {
      summaryForUser:
        input.moderatorSynthesis.executivePositioning ||
        'Expanded idea brief ready for discussion before prompt and todo generation.',
      expandedIdea: [
        ideaSnippet,
        '',
        `Core problem: ${input.moderatorSynthesis.coreProblem}`,
        `Proposed solution: ${input.moderatorSynthesis.proposedSolution}`,
        `MVP scope: ${input.moderatorSynthesis.mvpScope.join('; ')}`,
      ].join('\n'),
      analysis: [
        'Keep the structured council workflow and schema-validated outputs.',
        'Discuss tools and AI choices before locking the master prompt.',
        ...input.moderatorSynthesis.additionsToIdea.slice(0, 5),
      ].join('\n'),
      acceptRecommendations:
        mustHaves.length > 0
          ? mustHaves
          : ['Keep the primary user journey and MVP module list'],
      applyRecommendations:
        additions.length > 0
          ? additions
          : input.moderatorSynthesis.additionsToIdea.slice(0, 5),
      toolsToUse: [
        {
          name: 'Vite + React + TypeScript',
          why: 'Fast local UI development for the web app.',
          required: true,
        },
        {
          name: 'NestJS + Fastify',
          why: 'Typed API surface aligned with this monorepo pattern.',
          required: true,
        },
        {
          name: 'Zod',
          why: 'Shared schema validation between web and API.',
          required: true,
        },
        {
          name: 'PostgreSQL + Redis',
          why: 'Durable artifacts and stream replay for local/production parity.',
          required: false,
        },
      ],
      aiChoices: [
        {
          name: 'OpenRouter / GPT-class chat model',
          role: 'Primary planning and prompt generation',
          why: 'Good structured JSON and long-form markdown generation for briefs.',
        },
        {
          name: 'Cursor Agent / Composer',
          role: 'Implementation tool for the master prompt and todos',
          why: 'File-scoped coding with acceptance checks matches the todo list shape.',
        },
      ],
      openQuestions: input.moderatorSynthesis.openQuestions,
    }
  }

  private createFallbackMasterPrompt(
    input: {
      approvedIdeaBrief: IdeaBrief
      targetTool: DevelopmentPromptTargetTool
    },
    toolGuidance: string[],
  ): MasterPrompt {
    const tools = input.approvedIdeaBrief.toolsToUse
      .map((tool) => `- ${tool.name}: ${tool.why}${tool.required ? ' (required)' : ''}`)
      .join('\n')
    const ais = input.approvedIdeaBrief.aiChoices
      .map((ai) => `- ${ai.name} (${ai.role}): ${ai.why}`)
      .join('\n')

    return {
      title: 'Master build prompt',
      targetTool: input.targetTool,
      markdownBody: [
        '# Product brief',
        '',
        input.approvedIdeaBrief.summaryForUser,
        '',
        '## Expanded idea',
        '',
        input.approvedIdeaBrief.expandedIdea,
        '',
        '## Analysis',
        '',
        input.approvedIdeaBrief.analysis,
        '',
        '## Accept',
        '',
        ...input.approvedIdeaBrief.acceptRecommendations.map((item) => `- ${item}`),
        '',
        '## Apply / change',
        '',
        ...input.approvedIdeaBrief.applyRecommendations.map((item) => `- ${item}`),
        '',
        '## Tools',
        '',
        tools,
        '',
        '## AI choices',
        '',
        ais,
        '',
        '## Implementation principles',
        '',
        '- Build a web application in small verified steps.',
        '- Keep schemas shared and validate all API payloads.',
        '- Prefer local-first MVP over premature orchestration.',
        '',
        '## Tool guidance',
        '',
        ...toolGuidance.map((item) => `- ${item}`),
      ].join('\n'),
    }
  }

  private createFallbackUiPrompt(
    input: {
      approvedIdeaBrief: IdeaBrief
      targetTool: DevelopmentPromptTargetTool
    },
    toolGuidance: string[],
  ): UiPrompt {
    return {
      title: 'UI/UX design prompt',
      targetTool: input.targetTool,
      markdownBody: [
        '# UI/UX brief',
        '',
        input.approvedIdeaBrief.summaryForUser,
        '',
        '## Product context',
        '',
        input.approvedIdeaBrief.expandedIdea,
        '',
        '## Visual direction',
        '',
        '- One clear composition per screen; avoid dashboard clutter unless the product is a dashboard.',
        '- Use expressive typography and a defined token system (colors, spacing, radii).',
        '- Prefer atmospheric backgrounds over flat single colors.',
        '',
        '## Screens & flows',
        '',
        ...input.approvedIdeaBrief.acceptRecommendations.map((item) => `- ${item}`),
        '',
        '## Must refine before build',
        '',
        ...input.approvedIdeaBrief.applyRecommendations.map((item) => `- ${item}`),
        '',
        '## Component inventory',
        '',
        '- Navigation / header',
        '- Primary form and CTA group',
        '- Empty, loading, and error states',
        '- Footer with brand + social links when applicable',
        '',
        '## Interaction & accessibility',
        '',
        '- Keyboard-focusable controls and visible focus rings',
        '- Motion for hierarchy (2–3 intentional motions), not decoration spam',
        '- Mobile-first layouts that preserve the two-pane flows when needed',
        '',
        '## Tool guidance',
        '',
        ...toolGuidance.map((item) => `- ${item}`),
      ].join('\n'),
    }
  }

  private createFallbackTodoList(_input: {
    approvedIdeaBrief: IdeaBrief
  }): TodoList {
    return {
      overview:
        'Step-by-step build order derived from the approved idea brief. Complete acceptance checks before moving on.',
      items: [
        {
          step: 1,
          title: 'Scaffold the web app shell',
          details:
            'Create Vite + React + TypeScript app with routing and a primary layout covering the main screens from the idea.',
          acceptanceCheck: 'App boots locally and shows an empty home route.',
          suggestedFiles: ['apps/web/src/App.tsx', 'apps/web/src/main.tsx'],
        },
        {
          step: 2,
          title: 'Define shared schemas',
          details:
            'Encode core entities from the approved idea as Zod schemas shared by web and API.',
          acceptanceCheck: 'Fixture objects parse against the new schemas.',
          suggestedFiles: ['packages/schemas/src'],
        },
        {
          step: 3,
          title: 'Implement primary screens',
          details:
            'Build the must-have UI flows from acceptRecommendations / applyRecommendations.',
          acceptanceCheck: 'Primary user journey screens are reachable.',
          suggestedFiles: ['apps/web/src'],
        },
        {
          step: 4,
          title: 'Wire MVP APIs',
          details: 'Implement API endpoints required by the MVP journey with schema validation.',
          acceptanceCheck: 'Happy-path endpoints return schema-valid JSON.',
          suggestedFiles: ['apps/api/src'],
        },
        {
          step: 5,
          title: 'Add verification gates',
          details: 'Add tests covering the acceptance checks from earlier steps.',
          acceptanceCheck: 'Targeted tests pass locally.',
          suggestedFiles: ['apps/api/src', 'apps/web/src'],
        },
      ],
    }
  }
}
