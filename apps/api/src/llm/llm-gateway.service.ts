import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { z } from 'zod'
import type { ApiEnv } from '../config/env.js'
import { LlmProviderRegistry } from './llm-provider.registry.js'
import type {
  LlmMessage,
  LlmProviderId,
  StructuredJsonRequest,
  StructuredJsonResult,
} from './llm.types.js'
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

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const providerId = this.resolveProviderId(attempt)
      const model = this.resolveModel(attempt)
      const provider = this.providerRegistry.getProvider(providerId)
      const providerResponse = await provider.completeJson({
        taskName: request.taskName,
        model,
        messages: this.createAttemptMessages(request.messages, errors),
        responseFormat: 'json_object',
      })

      usage = addUsage(usage, providerResponse.usage)
      lastRawText = providerResponse.rawText

      const parsed = this.parseAndValidate(
        request.schema,
        providerResponse.rawText,
      )

      if (parsed.success) {
        return {
          value: parsed.value,
          rawText: providerResponse.rawText,
          validationStatus: attempt === 1 ? 'valid' : 'repaired',
          providerId,
          model,
          attempts: attempt,
          usage,
          errors,
        }
      }

      errors.push(parsed.error)
    }

    const providerId = this.resolveProviderId(maxAttempts)
    const model = this.resolveModel(maxAttempts)

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

  private resolveProviderId(attempt: number): LlmProviderId {
    return attempt === 1
      ? this.configService.get('LLM_PRIMARY_PROVIDER', { infer: true }) ?? 'mock'
      : this.configService.get('LLM_FALLBACK_PROVIDER', { infer: true }) ?? 'mock'
  }

  private resolveModel(attempt: number) {
    return attempt === 1
      ? this.configService.get('LLM_PRIMARY_MODEL', { infer: true }) ??
          'mock-json-v1'
      : this.configService.get('LLM_FALLBACK_MODEL', { infer: true }) ??
          'mock-json-v1'
  }
}
