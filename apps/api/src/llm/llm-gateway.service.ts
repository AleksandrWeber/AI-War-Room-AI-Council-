import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ModelRouterRole } from '@ai-war-room/schemas'
import type { z } from 'zod'
import type { ApiEnv } from '../config/env.js'
import { ModelRouterService } from '../model-router/model-router.service.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { ProviderCredentialsService } from '../provider-credentials/provider-credentials.service.js'
import { LlmProviderRegistry } from './llm-provider.registry.js'
import type { LlmMessage, StructuredJsonRequest, StructuredJsonResult } from './llm.types.js'
import {
  addUsage,
  emptyUsage,
  parseJsonObject,
} from './llm.utils.js'

@Injectable()
export class LlmGatewayService {
  constructor(
    private readonly configService: ConfigService<ApiEnv, true>,
    private readonly providerRegistry: LlmProviderRegistry,
    private readonly observabilityService: ObservabilityService,
    private readonly modelRouterService: ModelRouterService,
    private readonly providerCredentialsService: ProviderCredentialsService,
  ) {}

  async generateStructuredJson<TSchema extends z.ZodType>(
    request: StructuredJsonRequest<TSchema>,
  ): Promise<StructuredJsonResult<z.infer<TSchema>>> {
    const maxAttempts =
      request.maxAttempts ??
      this.configService.get('LLM_MAX_ATTEMPTS', { infer: true }) ??
      3
    const errors: string[] = []
    let usage = emptyUsage()
    let lastRawText = ''
    let lastModelId = ''

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const modelDecision = await this.modelRouterService.selectModel({
        taskName: request.taskName,
        role: this.resolveRouterRole(request.taskName),
        forceDeputy: attempt > 1,
      })
      const providerId = modelDecision.selected.providerId
      const model = modelDecision.selected.modelName
      lastModelId = modelDecision.selected.modelId

      if (
        providerId !== 'mock' &&
        this.configService.get('NODE_ENV', { infer: true }) !== 'production' &&
        !this.configService.get('LLM_ALLOW_REAL_PROVIDERS', { infer: true })
      ) {
        throw new Error(
          'Refusing non-mock LLM call without LLM_ALLOW_REAL_PROVIDERS=true outside production.',
        )
      }

      const provider = this.providerRegistry.getProvider(providerId)
      const apiKeyOverride =
        providerId === 'mock'
          ? undefined
          : await this.providerCredentialsService.resolveApiKey({
              workspaceId: request.workspaceId,
              providerId,
            })
      const attemptStartedAt = Date.now()
      let providerResponse

      try {
        providerResponse = await provider.completeJson({
          taskName: request.taskName,
          model,
          messages: this.createAttemptMessages(request.messages, errors),
          responseFormat: 'json_object',
          workspaceId: request.workspaceId,
          apiKeyOverride: apiKeyOverride ?? undefined,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown provider failure.'
        this.observabilityService.record(
          'llm_provider_failure',
          {
            taskName: request.taskName,
            providerId,
            model,
            attempt,
            durationMs: Date.now() - attemptStartedAt,
            errorMessage,
          },
          'error',
        )
        await this.modelRouterService.markModelDegraded(
          modelDecision.selected.modelId,
          errorMessage,
        )
        errors.push(errorMessage)

        if (attempt < maxAttempts) {
          continue
        }

        break
      }

      usage = addUsage(usage, providerResponse.usage)
      lastRawText = providerResponse.rawText

      const parsed = this.parseAndValidate(
        request.schema,
        providerResponse.rawText,
      )

      if (parsed.success) {
        const validationStatus = attempt === 1 ? 'valid' : 'repaired'

        this.observabilityService.record('llm_call_completed', {
          taskName: request.taskName,
          providerId,
          model,
          modelId: modelDecision.selected.modelId,
          modelSelectionDecisionId: modelDecision.decisionId,
          attempts: attempt,
          validationStatus,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          estimatedCostUsd: usage.estimatedCostUsd,
          durationMs: Date.now() - attemptStartedAt,
        })

        return {
          value: parsed.value,
          rawText: providerResponse.rawText,
          validationStatus,
          providerId,
          model,
          attempts: attempt,
          usage,
          errors,
        }
      }

      errors.push(parsed.error)
      this.observabilityService.record(
        'llm_validation_failure',
        {
          taskName: request.taskName,
          providerId,
          model,
          attempt,
          errorMessage: parsed.error,
        },
        'warn',
      )
    }

    const fallbackDecision = await this.modelRouterService.selectModel({
      taskName: request.taskName,
      role: this.resolveRouterRole(request.taskName),
      forceDeputy: true,
    })
    const providerId = fallbackDecision.selected.providerId
    const model = fallbackDecision.selected.modelName

    this.observabilityService.record(
      'llm_fallback_used',
      {
        taskName: request.taskName,
        providerId,
        model,
        modelId: lastModelId || fallbackDecision.selected.modelId,
        modelSelectionDecisionId: fallbackDecision.decisionId,
        attempts: maxAttempts,
        validationErrorCount: errors.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        estimatedCostUsd: usage.estimatedCostUsd,
      },
      'error',
    )

    return {
      value: request.fallback,
      rawText: lastRawText,
      validationStatus: 'fallback',
      providerId,
      model,
      attempts: maxAttempts,
      usage,
      errors,
    }
  }

  private parseAndValidate<TSchema extends z.ZodType>(
    schema: TSchema,
    rawText: string,
  ):
    | { success: true; value: z.infer<TSchema> }
    | { success: false; error: string } {
    try {
      const json = parseJsonObject(rawText)
      const result = schema.safeParse(json)

      if (!result.success) {
        return {
          success: false,
          error: result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('; '),
        }
      }

      return {
        success: true,
        value: result.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parse error.',
      }
    }
  }

  private createAttemptMessages(messages: LlmMessage[], errors: string[]) {
    if (errors.length === 0) {
      return messages
    }

    return [
      ...messages,
      {
        role: 'user' as const,
        content: [
          'The previous response failed JSON validation.',
          'Return only a valid JSON object that satisfies the requested schema.',
          `Validation errors: ${errors.at(-1)}`,
        ].join('\n'),
      },
    ]
  }

  private resolveRouterRole(taskName: string): ModelRouterRole {
    if (taskName === 'triage/v1') {
      return 'triage'
    }

    if (taskName === 'moderator/v1') {
      return 'moderator'
    }

    if (taskName === 'shield/llm_classifier/v1') {
      return 'shield_classifier'
    }

    if (taskName === 'chunk_summary/v1') {
      return 'moderator'
    }

    if (taskName.startsWith('agents/')) {
      return (taskName.split('/')[1] as ModelRouterRole | undefined) ?? 'critic'
    }

    if (taskName.startsWith('artifacts/')) {
      return (taskName.split('/')[1] as ModelRouterRole | undefined) ?? 'prd'
    }

    return 'critic'
  }
}
